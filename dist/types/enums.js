"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOccasion = exports.MealType = exports.CuisineType = exports.RestaurantType = exports.AuthProvider = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["BUSINESS"] = "business";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["LOCAL"] = "local";
    AuthProvider["GOOGLE"] = "google";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
var RestaurantType;
(function (RestaurantType) {
    RestaurantType["VEGAN"] = "vegan";
    RestaurantType["VEGETARIAN"] = "vegetarian";
    RestaurantType["TRADITIONAL_WITH_VEGE"] = "traditional_with_vege";
})(RestaurantType || (exports.RestaurantType = RestaurantType = {}));
var CuisineType;
(function (CuisineType) {
    CuisineType["POLISH"] = "polish";
    CuisineType["ITALIAN"] = "italian";
    CuisineType["ASIAN"] = "asian";
    CuisineType["FUSION"] = "fusion";
    CuisineType["MEDITERRANEAN"] = "mediterranean";
    CuisineType["INDIAN"] = "indian";
    CuisineType["AMERICAN"] = "american";
    CuisineType["MEXICAN"] = "mexican";
    CuisineType["JAPANESE"] = "japanese";
    CuisineType["KOREAN"] = "korean";
    CuisineType["CHINESE"] = "chinese";
    CuisineType["THAI"] = "thai";
    CuisineType["VIETNAMESE"] = "vietnamese";
    CuisineType["MALAYSIAN"] = "malaysian";
})(CuisineType || (exports.CuisineType = CuisineType = {}));
var MealType;
(function (MealType) {
    MealType["BREAKFAST"] = "breakfast";
    MealType["STARTER"] = "starter";
    MealType["SOUP"] = "soup";
    MealType["SALAD"] = "salad";
    MealType["MAIN"] = "main";
    MealType["DESSERT"] = "dessert";
    MealType["BEVERAGE"] = "beverage";
    MealType["SNACK"] = "snack";
})(MealType || (exports.MealType = MealType = {}));
var RestaurantOccasion;
(function (RestaurantOccasion) {
    // Romantic & Special
    RestaurantOccasion["DATE"] = "date";
    RestaurantOccasion["ANNIVERSARY"] = "anniversary";
    RestaurantOccasion["PROPOSAL"] = "proposal";
    // Social & Family
    RestaurantOccasion["FAMILY"] = "family";
    RestaurantOccasion["FRIENDS_GATHERING"] = "friends_gathering";
    RestaurantOccasion["BIRTHDAY"] = "birthday";
    RestaurantOccasion["GROUP_DINING"] = "group_dining";
    // Professional
    RestaurantOccasion["BUSINESS"] = "business";
    RestaurantOccasion["CLIENT_MEETING"] = "client_meeting";
    RestaurantOccasion["WORK_LUNCH"] = "work_lunch";
    // Casual
    RestaurantOccasion["QUICK_LUNCH"] = "quick_lunch";
    RestaurantOccasion["CASUAL_DINNER"] = "casual_dinner";
    RestaurantOccasion["TAKEAWAY"] = "takeaway";
    // Special Events
    RestaurantOccasion["CELEBRATIONS"] = "celebrations";
    RestaurantOccasion["PRIVATE_EVENTS"] = "private_events";
    // Time-based
    RestaurantOccasion["BRUNCH"] = "brunch";
    RestaurantOccasion["LATE_NIGHT"] = "late_night";
})(RestaurantOccasion || (exports.RestaurantOccasion = RestaurantOccasion = {}));
