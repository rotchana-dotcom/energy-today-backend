/**
 * OpenFoodFacts API Integration
 * Free food database with barcode lookup
 * https://world.openfoodfacts.org/data
 */

export interface FoodProduct {
  barcode: string;
  name: string;
  brand?: string;
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  imageUrl?: string;
}

interface OpenFoodFactsProduct {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    serving_size?: string;
    nutriments?: {
      "energy-kcal_100g"?: number;
      "energy-kcal_serving"?: number;
      proteins_100g?: number;
      proteins_serving?: number;
      carbohydrates_100g?: number;
      carbohydrates_serving?: number;
      fat_100g?: number;
      fat_serving?: number;
      fiber_100g?: number;
      fiber_serving?: number;
      sugars_100g?: number;
      sugars_serving?: number;
      sodium_100g?: number;
      sodium_serving?: number;
    };
    image_url?: string;
  };
  status: number;
  status_verbose: string;
}

/**
 * Look up product by barcode
 */
export async function lookupBarcode(barcode: string): Promise<FoodProduct | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data: OpenFoodFactsProduct = await response.json();
    
    if (data.status !== 1 || !data.product) {
      return null;
    }
    
    const product = data.product;
    const nutriments = product.nutriments || {};
    
    // Prefer serving size data, fall back to 100g data
    return {
      barcode,
      name: product.product_name || "Unknown Product",
      brand: product.brands,
      servingSize: product.serving_size,
      calories: nutriments["energy-kcal_serving"] || nutriments["energy-kcal_100g"],
      protein: nutriments.proteins_serving || nutriments.proteins_100g,
      carbs: nutriments.carbohydrates_serving || nutriments.carbohydrates_100g,
      fat: nutriments.fat_serving || nutriments.fat_100g,
      fiber: nutriments.fiber_serving || nutriments.fiber_100g,
      sugar: nutriments.sugars_serving || nutriments.sugars_100g,
      sodium: nutriments.sodium_serving || nutriments.sodium_100g,
      imageUrl: product.image_url,
    };
  } catch (error) {
    console.error("Error looking up barcode:", error);
    return null;
  }
}

/**
 * Search products by name
 */
export async function searchProducts(query: string, page: number = 1): Promise<FoodProduct[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=20&json=1`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }
    
    return data.products.map((product: any) => ({
      barcode: product.code,
      name: product.product_name || "Unknown Product",
      brand: product.brands,
      servingSize: product.serving_size,
      calories: product.nutriments?.["energy-kcal_serving"] || product.nutriments?.["energy-kcal_100g"],
      protein: product.nutriments?.proteins_serving || product.nutriments?.proteins_100g,
      carbs: product.nutriments?.carbohydrates_serving || product.nutriments?.carbohydrates_100g,
      fat: product.nutriments?.fat_serving || product.nutriments?.fat_100g,
      fiber: product.nutriments?.fiber_serving || product.nutriments?.fiber_100g,
      sugar: product.nutriments?.sugars_serving || product.nutriments?.sugars_100g,
      sodium: product.nutriments?.sodium_serving || product.nutriments?.sodium_100g,
      imageUrl: product.image_url,
    })).filter((p: FoodProduct) => p.name !== "Unknown Product");
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
