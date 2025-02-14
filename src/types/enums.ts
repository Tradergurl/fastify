export enum UserRole {
  CLIENT = "client",
  BUSINESS = "business",
  ADMIN = "admin",
}

export enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
}

export enum RestaurantType {
  VEGAN = "vegan",
  VEGETARIAN = "vegetarian",
  TRADITIONAL_WITH_VEGE = "traditional_with_vege",
}

export enum CuisineType {
  POLISH = "polish",
  ITALIAN = "italian",
  ASIAN = "asian",
  FUSION = "fusion",
  MEDITERRANEAN = "mediterranean",
  INDIAN = "indian",
  AMERICAN = "american",
  MEXICAN = "mexican",
  JAPANESE = "japanese",
  KOREAN = "korean",
  CHINESE = "chinese",
  THAI = "thai",
  VIETNAMESE = "vietnamese",
  MALAYSIAN = "malaysian",
}

export enum MealType {
  BREAKFAST = "breakfast",
  STARTER = "starter",
  SOUP = "soup",
  SALAD = "salad",
  MAIN = "main",
  DESSERT = "dessert",
  BEVERAGE = "beverage",
  SNACK = "snack",
}

export enum RestaurantOccasion {
  // Romantic & Special
  DATE = "date",
  ANNIVERSARY = "anniversary",
  PROPOSAL = "proposal",

  // Social & Family
  FAMILY = "family",
  FRIENDS_GATHERING = "friends_gathering",
  BIRTHDAY = "birthday",
  GROUP_DINING = "group_dining",

  // Professional
  BUSINESS = "business",
  CLIENT_MEETING = "client_meeting",
  WORK_LUNCH = "work_lunch",

  // Casual
  QUICK_LUNCH = "quick_lunch",
  CASUAL_DINNER = "casual_dinner",
  TAKEAWAY = "takeaway",

  // Special Events
  CELEBRATIONS = "celebrations",
  PRIVATE_EVENTS = "private_events",

  // Time-based
  BRUNCH = "brunch",
  LATE_NIGHT = "late_night",
}
