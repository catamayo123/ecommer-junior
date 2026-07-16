// propiedades que comparten los cursos y los libros 
export interface IBaseICourseAndIBook{
    orderItemId: string;
    productId: string;
    name: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    fileName: string | null;
    category: string;
    categorySlug: string;
    purchasedAt: Date | null;
}

// Acceso permanente a los videos del curso + url del video 
export interface ICourses extends IBaseICourseAndIBook{
    canAccess: true;
    urlVideo: string;
}

// Dependiendo del token JWT se descarga o no 
export interface IeBooks extends IBaseICourseAndIBook{
    downloadToken: string | null;
    downloadTokenExpiresAt: Date | null;
    renewalCount: number;
    canDownload: boolean;
    isExpired: boolean;
}