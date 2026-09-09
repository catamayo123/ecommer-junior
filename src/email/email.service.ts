import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name); //
  private transporter!: nodemailer.Transporter;
  private verificTemplate!: HandlebarsTemplateDelegate;
  private passResetTemplete!: HandlebarsTemplateDelegate;

  async onModuleInit() {
    await this.createTransporter();
  }

  // ENVIAR CODE POR EMAIL 
  async sendVerificCode(destinatario: string, code: string): Promise<void> {
    const html = this.verificTemplate({
      code,
      year: new Date().getFullYear()
    });

    try {
      const infoMessUrl = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'Ecommerce digital <noreply@ecommerce.com>',
        to: destinatario,
        subject: 'Email de verificacion del Econmmerce Digital',
        html,
      });

      this.logger.log(`Verificacion de Email enviada a: ${destinatario}`)

      const url = nodemailer.getTestMessageUrl(infoMessUrl)
      if (url) this.logger.log(`URL: ${url}`)

    } catch (error) {
      this.logger.error(`Error al enviar el codigo de verificacion a : ${destinatario}`, error as Error);
      throw error;   // lanzar para que el llamador decida que va a hacer 
    }
  }

  async sendPassResetCode(destinatario: string, code: string): Promise<void> {
    const html = this.passResetTemplete({
      code,
      year: new Date().getFullYear()
    });

    try {
      const infoMessUrl = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'Ecommerce digital <noreply@ecommerce.com>',
        to: destinatario,
        subject: 'Email de recuperacion del Econmmerce Digital',
        html,
      });

      this.logger.log(`Recuperacion de Email enviada a: ${destinatario}`)

      const url = nodemailer.getTestMessageUrl(infoMessUrl)
      if (url) this.logger.log(`URL: ${url}`)

    } catch (error) {
      this.logger.error(`Error al enviar el email de recuperacion a : ${destinatario}`, error as Error);
      throw error;   // lanzar para que el llamador decida que va a hacer 
    }
  }

  // METODO PRIVADO PARA CONFIGURAR BREVO EN PRODUCCION
  private async createTransporter(): Promise<void> {
    const smtpHost = process.env.SMTP_HOST;

    // Si no hay SMTP_HOST configurador, Usar servicio de correo Ethereal (Caso desarrollo)
    if (!smtpHost || smtpHost === 'smtp.ethereal.email') {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log('Email Transporter: Ethereal (Caso Desarrollo)');

    } else {
      // Servicio de Brevo en produccion u otro SMTP
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: (process.env.SMTP_PORT === '465'),
        requireTLS: true,  // forzar conexion cifrada 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      this.logger.log(`Email credentials: ${smtpHost} ( Caso Produccion)`);
    }

    // validar credenciales al arrancar 
    await this.transporter.verify();
    this.logger.log('Conexion SMTP verificada');

    // cargar plantillas una sola vez para mejorar el rendimiento 
    this.verificTemplate = handlebars.compile(
      readFileSync(join(__dirname, 'templates', 'verific-code.html'), 'utf-8')
    );

    this.passResetTemplete = handlebars.compile(
      readFileSync(join(__dirname, 'templates', 'pass-reset.html'), 'utf-8')
    );
  }

}
