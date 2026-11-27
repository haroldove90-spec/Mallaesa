import { ProductItem } from '../types';
import productsJson from './initialProducts.json';

export const INITIAL_PRODUCTS: ProductItem[] = productsJson as ProductItem[];

export const CATALOG_TYPE_LABELS: Record<string, string> = {
  todos: 'Todos los Productos',
  importacion: 'Catálogo de Importación',
  tuberias_laminas: 'Tuberías y Láminas',
  malla_ciclonica: 'Malla Ciclónica',
  reja_inde: 'Reja INDE y Puertas',
  concertina_alambres: 'Concertina y Alambres',
  accesorios_herrajes: 'Accesorios y Herrajes',
  mallas_especiales: 'Mallas Especiales',
  otros: 'Otros Accesorios'
};
