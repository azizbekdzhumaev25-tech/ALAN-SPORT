import fs from "fs";
import path from "path";

export type ProductItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  description: string;
  sizes?: string | null;
  image: string; // главная обложка
  images?: string[]; // массив дополнительных фото
  featured: boolean;
  isNew?: boolean; // 👈 Показ в блоке "Yangi Kelganlar"
  promoTag?: string; // 👈 Ярлык для акции (подарок, скидка)
};

const filePath = path.join(process.cwd(), "data", "products.json");

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "Nike Air Max 270 krossovkasi",
    category: "krossovkalar",
    price: 480000,
    oldPrice: 560000,
    description: "Yengil va qulay krossovka — kundalik yurish va yugurish uchun ideal. Yumshoq taglik va nafas oluvchi mato.",
    sizes: "39,40,41,42,43,44,45",
    image: "https://images.pexels.com/photos/17931282/pexels-photo-17931282.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
  },
  {
    id: 2,
    name: "Adidas Ultraboost yugurish krossovkasi",
    category: "krossovkalar",
    price: 650000,
    oldPrice: null,
    description: "Professional yuguruvchilar uchun yuqori amortizatsiyali krossovka. Chidamli taglik va qulay oyoq qismi.",
    sizes: "40,41,42,43,44",
    image: "https://images.pexels.com/photos/8551780/pexels-photo-8551780.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
  },
  {
    id: 3,
    name: "Qizil yengil sport krossovkasi",
    category: "krossovkalar",
    price: 380000,
    oldPrice: 450000,
    description: "Yengil sport krossovkasi — mashg'ulot va sayr uchun. Yorqin dizayn va qulay qolip.",
    sizes: "39,40,41,42,43",
    image: "https://images.pexels.com/photos/11324546/pexels-photo-11324546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
  },
  {
    id: 4,
    name: "Oq klassik krossovka",
    category: "krossovkalar",
    price: 420000,
    oldPrice: null,
    description: "Klassik oq krossovka — har qanday kiyim bilan mos. Sifatli mato va mustahkam tag.",
    sizes: "40,41,42,43,44,45",
    image: "https://images.pexels.com/photos/11324518/pexels-photo-11324518.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
  },
  {
    id: 5,
    name: "Qora sport kostyumi",
    category: "kiyimlar",
    price: 350000,
    oldPrice: 420000,
    description: "Qulay qora sport kostyumi — mashg'ulot va kundalik hayot uchun. Sifatli mato, S dan XXL gacha.",
    sizes: "S,M,L,XL,XXL",
    image: "https://images.pexels.com/photos/5604029/pexels-photo-5604029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
  },
  {
    id: 6,
    name: "Sport futbolka (qora)",
    category: "kiyimlar",
    price: 120000,
    oldPrice: null,
    description: "Nafas oluvchi qora sport futbolka. Terni tez qurituvchi mato, har qanday mashg'ulot uchun.",
    sizes: "S,M,L,XL",
    image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
  },
  {
    id: 7,
    name: "Kapushonli sport hudisi",
    category: "kiyimlar",
    price: 280000,
    oldPrice: null,
    description: "Issiq kapushonli hudi — salqin kunlar uchun. Yumshoq ichki qatlam va mustahkam choklar.",
    sizes: "M,L,XL,XXL",
    image: "https://images.pexels.com/photos/37124612/pexels-photo-37124612.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
  },
  {
    id: 8,
    name: "Dri-FIT mashg'ulot futbolkasi",
    category: "kiyimlar",
    price: 160000,
    oldPrice: null,
    description: "Mashg'ulot uchun yengil futbolka — terni tez quritadi va harakatda xalaqit bermaydi.",
    sizes: "S,M,L,XL",
    image: "https://images.pexels.com/photos/4378326/pexels-photo-4378326.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
  },
  {
    id: 9,
    name: "Gantellar to'plami (2x5 kg)",
    category: "anjomlar",
    price: 300000,
    oldPrice: 350000,
    description: "Uy sharoitida mashg'ulot uchun 2x5 kg gantellar to'plami. Qulay ushlash, rezina qoplama.",
    sizes: null,
    image: "https://images.pexels.com/photos/35567437/pexels-photo-35567437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
  },
  {
    id: 10,
    name: "Professional futbol to'pi",
    category: "anjomlar",
    price: 180000,
    oldPrice: 220000,
    description: "Professional darajadagi futbol to'pi — chidamli qoplama va aniq harakat. 5-o'lcham.",
    sizes: null,
    image: "https://images.pexels.com/photos/27915834/pexels-photo-27915834.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
  },
  {
    id: 11,
    name: "Boks qo'lqoplari (12 oz)",
    category: "anjomlar",
    price: 260000,
    oldPrice: null,
    description: "12 oz boks qo'lqoplari — mashg'ulot uchun ishonchli himoya va qulay bilak bog'ichi.",
    sizes: null,
    image: "https://images.pexels.com/photos/13179513/pexels-photo-13179513.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
  },
  {
    id: 12,
    name: "Sport sumkasi (45 l)",
    category: "aksessuarlar",
    price: 210000,
    oldPrice: 260000,
    description: "45 litrlik sport sumkasi — krossovka va kiyim bemalol sig'adi. Suv o'tkazmaydigan mato.",
    sizes: null,
    image: "https://images.pexels.com/photos/28726897/pexels-photo-28726897.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
  },
  {
    id: 13,
    name: "Sport kepkasi (qora)",
    category: "aksessuarlar",
    price: 95000,
    oldPrice: null,
    description: "Qora sport kepkasi — quyoshdan himoya va sport uslubi. Regulirlanuvchi o'lcham.",
    sizes: null,
    image: "https://images.pexels.com/photos/13876038/pexels-photo-13876038.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
  },
];

export function getProducts(): ProductItem[] {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_PRODUCTS, null, 2), "utf-8");
      return DEFAULT_PRODUCTS;
    }
    const fileData = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileData);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveProducts(products: ProductItem[]) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Faylga saqlashda xatolik:", err);
  }
}

const categoriesFilePath = path.join(process.cwd(), "data", "categories.json");

export type CategoryCover = {
  key: string;
  label: string;
  desc: string;
  image: string;
  promoTag?: string; // 👈 Ярлык акции для категории
};

export function getCategories(): CategoryCover[] {
  try {
    if (!fs.existsSync(categoriesFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(categoriesFilePath, "utf-8");
    const parsed = JSON.parse(fileData);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCategories(categories: CategoryCover[]) {
  try {
    const dir = path.dirname(categoriesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.error("Categories saqlashda xatolik:", err);
  }
}