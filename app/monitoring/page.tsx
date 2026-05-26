"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import NavBar from "@/components/NavBar";

type GroupMode = "campaign" | "product" | "brand";

type ArgusStats = {
  total_ads: number;
  by_category?: { value: string; count: number }[];
  by_brand?: { value: string; count: number }[];
  risk_labels?: string[];
};

type IabTaxonomyRow = {
  id: string;
  label: string;
  tier1: string;
  tier2: string;
  tier3: string;
  keywords: string;
};

const IAB_TAXONOMY: IabTaxonomyRow[] = [
  {
    "id": "1000",
    "label": "Adult Content",
    "tier1": "Adult Content",
    "tier2": "",
    "tier3": "",
    "keywords": "adult content"
  },
  {
    "id": "1001",
    "label": "Alcohol",
    "tier1": "Alcohol",
    "tier2": "",
    "tier3": "",
    "keywords": "alcohol"
  },
  {
    "id": "1002",
    "label": "Bars",
    "tier1": "Alcohol",
    "tier2": "Bars",
    "tier3": "",
    "keywords": "bars"
  },
  {
    "id": "1003",
    "label": "Beer",
    "tier1": "Alcohol",
    "tier2": "Beer",
    "tier3": "",
    "keywords": "beer"
  },
  {
    "id": "1004",
    "label": "Hard Sodas, Seltzers, Alco Pops",
    "tier1": "Alcohol",
    "tier2": "Hard Sodas, Seltzers, Alco Pops",
    "tier3": "",
    "keywords": "hard sodas, seltzers, alco pops"
  },
  {
    "id": "1005",
    "label": "Spirits",
    "tier1": "Alcohol",
    "tier2": "Spirits",
    "tier3": "",
    "keywords": "spirits; vodka; whiskey; rum"
  },
  {
    "id": "1006",
    "label": "Wine",
    "tier1": "Alcohol",
    "tier2": "Wine",
    "tier3": "",
    "keywords": "wine,sangria"
  },
  {
    "id": "1007",
    "label": "Culture and Fine Arts",
    "tier1": "Culture and Fine Arts",
    "tier2": "",
    "tier3": "",
    "keywords": "culture and fine arts"
  },
  {
    "id": "1008",
    "label": "Museums and Galleries",
    "tier1": "Culture and Fine Arts",
    "tier2": "Museums and Galleries",
    "tier3": "",
    "keywords": "museums and galleries"
  },
  {
    "id": "1009",
    "label": "Business and Industrial",
    "tier1": "Business and Industrial",
    "tier2": "",
    "tier3": "",
    "keywords": "business and industrial"
  },
  {
    "id": "1010",
    "label": "Advertising and Marketing",
    "tier1": "Business and Industrial",
    "tier2": "Advertising and Marketing",
    "tier3": "",
    "keywords": "advertising and marketing"
  },
  {
    "id": "1011",
    "label": "Business Services",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "",
    "keywords": "business services"
  },
  {
    "id": "1012",
    "label": "Consulting",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Consulting",
    "keywords": "consulting"
  },
  {
    "id": "1013",
    "label": "Employee Expense and Time Tracking Services",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Employee Expense and Time Tracking Services",
    "keywords": "employee expense and time tracking services"
  },
  {
    "id": "1014",
    "label": "Human Resources and Recruiting",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Human Resources and Recruiting",
    "keywords": "human resources and recruiting"
  },
  {
    "id": "1015",
    "label": "Information Technology Services",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Information Technology Services",
    "keywords": "information technology services"
  },
  {
    "id": "1016",
    "label": "Laundry and Dry Cleaning Services",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Laundry and Dry Cleaning Services",
    "keywords": "laundry and dry cleaning services"
  },
  {
    "id": "1017",
    "label": "Logistics and Delivery",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Logistics and Delivery",
    "keywords": "logistics and delivery"
  },
  {
    "id": "1018",
    "label": "Office Equipment and Supplies",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Office Equipment and Supplies",
    "keywords": "office equipment and supplies"
  },
  {
    "id": "1019",
    "label": "Photographers",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Photographers",
    "keywords": "photographers"
  },
  {
    "id": "1020",
    "label": "Printing/Fax/WiFi Services",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Printing/Fax/WiFi Services",
    "keywords": "printing/fax/wifi services"
  },
  {
    "id": "1021",
    "label": "Public Relations and Strategic Communication",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Public Relations and Strategic Communication",
    "keywords": "public relations and strategic communication"
  },
  {
    "id": "1022",
    "label": "Security & Protection",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Security & Protection",
    "keywords": "security & protection"
  },
  {
    "id": "1023",
    "label": "Storage Facilities",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Storage Facilities",
    "keywords": "storage facilities"
  },
  {
    "id": "1024",
    "label": "Telecom Services",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Telecom Services",
    "keywords": "telecom services"
  },
  {
    "id": "1025",
    "label": "Web Hosting and Cloud Computing",
    "tier1": "Business and Industrial",
    "tier2": "Business Services",
    "tier3": "Web Hosting and Cloud Computing",
    "keywords": "web hosting and cloud computing"
  },
  {
    "id": "1026",
    "label": "Construction",
    "tier1": "Business and Industrial",
    "tier2": "Construction",
    "tier3": "",
    "keywords": "construction"
  },
  {
    "id": "1027",
    "label": "Energy Industry",
    "tier1": "Business and Industrial",
    "tier2": "Energy Industry",
    "tier3": "",
    "keywords": "energy industry"
  },
  {
    "id": "1028",
    "label": "Electric Power Industry",
    "tier1": "Business and Industrial",
    "tier2": "Energy Industry",
    "tier3": "Electric Power Industry",
    "keywords": "electric power industry"
  },
  {
    "id": "1029",
    "label": "Energy Services",
    "tier1": "Business and Industrial",
    "tier2": "Energy Industry",
    "tier3": "Energy Services",
    "keywords": "energy services"
  },
  {
    "id": "1030",
    "label": "Green Energy",
    "tier1": "Business and Industrial",
    "tier2": "Energy Industry",
    "tier3": "Green Energy",
    "keywords": "green energy"
  },
  {
    "id": "1031",
    "label": "Oil, Gas and Consumable Fuels",
    "tier1": "Business and Industrial",
    "tier2": "Energy Industry",
    "tier3": "Oil, Gas and Consumable Fuels",
    "keywords": "oil, gas and consumable fuels"
  },
  {
    "id": "1032",
    "label": "Forestry and Logging",
    "tier1": "Business and Industrial",
    "tier2": "Forestry and Logging",
    "tier3": "",
    "keywords": "forestry and logging"
  },
  {
    "id": "1033",
    "label": "Industrial Storage",
    "tier1": "Business and Industrial",
    "tier2": "Industrial Storage",
    "tier3": "",
    "keywords": "industrial storage"
  },
  {
    "id": "1034",
    "label": "Industrials",
    "tier1": "Business and Industrial",
    "tier2": "Industrials",
    "tier3": "",
    "keywords": "industrials"
  },
  {
    "id": "1035",
    "label": "Aerospace and Defense",
    "tier1": "Business and Industrial",
    "tier2": "Industrials",
    "tier3": "Aerospace and Defense",
    "keywords": "aerospace and defense"
  },
  {
    "id": "1036",
    "label": "Construction and Engineering",
    "tier1": "Business and Industrial",
    "tier2": "Industrials",
    "tier3": "Construction and Engineering",
    "keywords": "construction and engineering"
  },
  {
    "id": "1037",
    "label": "Industrial Conglomerates",
    "tier1": "Business and Industrial",
    "tier2": "Industrials",
    "tier3": "Industrial Conglomerates",
    "keywords": "industrial conglomerates"
  },
  {
    "id": "1038",
    "label": "Trading Companies and Distributors",
    "tier1": "Business and Industrial",
    "tier2": "Industrials",
    "tier3": "Trading Companies and Distributors",
    "keywords": "trading companies and distributors"
  },
  {
    "id": "1039",
    "label": "Transportation",
    "tier1": "Business and Industrial",
    "tier2": "Industrials",
    "tier3": "Transportation",
    "keywords": "transportation"
  },
  {
    "id": "1040",
    "label": "Manufacturing",
    "tier1": "Business and Industrial",
    "tier2": "Manufacturing",
    "tier3": "",
    "keywords": "manufacturing"
  },
  {
    "id": "1041",
    "label": "Medical and Biotechnology",
    "tier1": "Business and Industrial",
    "tier2": "Medical and Biotechnology",
    "tier3": "",
    "keywords": "medical and biotechnology"
  },
  {
    "id": "1042",
    "label": "Mining and Quarrying",
    "tier1": "Business and Industrial",
    "tier2": "Mining and Quarrying",
    "tier3": "",
    "keywords": "mining and quarrying"
  },
  {
    "id": "1043",
    "label": "Science and Laboratory",
    "tier1": "Business and Industrial",
    "tier2": "Science and Laboratory",
    "tier3": "",
    "keywords": "science and laboratory"
  },
  {
    "id": "1044",
    "label": "Signage",
    "tier1": "Business and Industrial",
    "tier2": "Signage",
    "tier3": "",
    "keywords": "signage"
  },
  {
    "id": "1045",
    "label": "Small Business",
    "tier1": "Business and Industrial",
    "tier2": "Small Business",
    "tier3": "",
    "keywords": "small business"
  },
  {
    "id": "1046",
    "label": "Waste Disposal and Recycling",
    "tier1": "Business and Industrial",
    "tier2": "Waste Disposal and Recycling",
    "tier3": "",
    "keywords": "waste disposal and recycling"
  },
  {
    "id": "1047",
    "label": "Cannabis",
    "tier1": "Cannabis",
    "tier2": "",
    "tier3": "",
    "keywords": "cannabis"
  },
  {
    "id": "1048",
    "label": "Cannabis Consumables",
    "tier1": "Cannabis",
    "tier2": "Cannabis Consumables",
    "tier3": "",
    "keywords": "cannabis consumables"
  },
  {
    "id": "1049",
    "label": "Cannabis Drinks",
    "tier1": "Cannabis",
    "tier2": "Cannabis Consumables",
    "tier3": "Cannabis Drinks",
    "keywords": "cannabis drinks"
  },
  {
    "id": "1050",
    "label": "Cannabis Edibles",
    "tier1": "Cannabis",
    "tier2": "Cannabis Consumables",
    "tier3": "Cannabis Edibles",
    "keywords": "cannabis edibles"
  },
  {
    "id": "1051",
    "label": "Cannabis Equipment",
    "tier1": "Cannabis",
    "tier2": "Cannabis Equipment",
    "tier3": "",
    "keywords": "cannabis equipment"
  },
  {
    "id": "1052",
    "label": "Cannabis Stores",
    "tier1": "Cannabis",
    "tier2": "Cannabis Stores",
    "tier3": "",
    "keywords": "cannabis stores"
  },
  {
    "id": "1053",
    "label": "Cannabis Stocks",
    "tier1": "Cannabis",
    "tier2": "Cannabis Stocks",
    "tier3": "",
    "keywords": "cannabis stocks"
  },
  {
    "id": "1054",
    "label": "CBD Consumables",
    "tier1": "Cannabis",
    "tier2": "CBD Consumables",
    "tier3": "",
    "keywords": "cbd consumables"
  },
  {
    "id": "1055",
    "label": "CBD Topicals",
    "tier1": "Cannabis",
    "tier2": "CBD Topicals",
    "tier3": "",
    "keywords": "cbd topicals"
  },
  {
    "id": "1056",
    "label": "Clothing and Accessories",
    "tier1": "Clothing and Accessories",
    "tier2": "",
    "tier3": "",
    "keywords": "clothing and accessories"
  },
  {
    "id": "1057",
    "label": "Clothing",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "",
    "keywords": "clothing, medical apparel, workwear, work apparel, uniforms"
  },
  {
    "id": "1058",
    "label": "Children's Clothing",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Children's Clothing",
    "keywords": "children's clothing"
  },
  {
    "id": "1059",
    "label": "Maternity Clothing",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Maternity Clothing",
    "keywords": "maternity clothing"
  },
  {
    "id": "1060",
    "label": "Men's Clothing",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Men's Clothing",
    "keywords": "men's clothing"
  },
  {
    "id": "1061",
    "label": "Sportswear",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Sportswear",
    "keywords": "sportswear"
  },
  {
    "id": "1062",
    "label": "Underwear and Lingerie",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Underwear and Lingerie",
    "keywords": "underwear and lingerie"
  },
  {
    "id": "1063",
    "label": "Wedding Dresses/Bridal Wear/Tuxedos",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Wedding Dresses/Bridal Wear/Tuxedos",
    "keywords": "wedding dresses/bridal wear/tuxedos"
  },
  {
    "id": "1064",
    "label": "Women's Clothing",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing",
    "tier3": "Women's Clothing",
    "keywords": "women's clothing"
  },
  {
    "id": "1065",
    "label": "Clothing Accessories",
    "tier1": "Clothing and Accessories",
    "tier2": "Clothing Accessories",
    "tier3": "",
    "keywords": "clothing accessories"
  },
  {
    "id": "1066",
    "label": "Costumes and Accessories",
    "tier1": "Clothing and Accessories",
    "tier2": "Costumes and Accessories",
    "tier3": "",
    "keywords": "costumes and accessories"
  },
  {
    "id": "1067",
    "label": "Footwear",
    "tier1": "Clothing and Accessories",
    "tier2": "Footwear",
    "tier3": "",
    "keywords": "footwear"
  },
  {
    "id": "1068",
    "label": "Footwear Accessories",
    "tier1": "Clothing and Accessories",
    "tier2": "Footwear Accessories",
    "tier3": "",
    "keywords": "footwear accessories"
  },
  {
    "id": "1069",
    "label": "Handbags and Wallets",
    "tier1": "Clothing and Accessories",
    "tier2": "Handbags and Wallets",
    "tier3": "",
    "keywords": "handbags and wallets"
  },
  {
    "id": "1070",
    "label": "Jewelry and Watches",
    "tier1": "Clothing and Accessories",
    "tier2": "Jewelry and Watches",
    "tier3": "",
    "keywords": "jewelry and watches"
  },
  {
    "id": "1071",
    "label": "Sunglasses",
    "tier1": "Clothing and Accessories",
    "tier2": "Sunglasses",
    "tier3": "",
    "keywords": "sunglasses"
  },
  {
    "id": "1072",
    "label": "Collectables and Antiques",
    "tier1": "Collectables and Antiques",
    "tier2": "",
    "tier3": "",
    "keywords": "collectables and antiques"
  },
  {
    "id": "1073",
    "label": "Antiques",
    "tier1": "Collectables and Antiques",
    "tier2": "Antiques",
    "tier3": "",
    "keywords": "antiques"
  },
  {
    "id": "1074",
    "label": "Coins and Paper Money",
    "tier1": "Collectables and Antiques",
    "tier2": "Coins and Paper Money",
    "tier3": "",
    "keywords": "coins and paper money"
  },
  {
    "id": "1075",
    "label": "Collectibles",
    "tier1": "Collectables and Antiques",
    "tier2": "Collectibles",
    "tier3": "",
    "keywords": "collectibles"
  },
  {
    "id": "1076",
    "label": "Entertainment Memorabilia",
    "tier1": "Collectables and Antiques",
    "tier2": "Entertainment Memorabilia",
    "tier3": "",
    "keywords": "entertainment memorabilia"
  },
  {
    "id": "1077",
    "label": "Sports Memorabilia and Trading Cards",
    "tier1": "Collectables and Antiques",
    "tier2": "Sports Memorabilia and Trading Cards",
    "tier3": "",
    "keywords": "sports memorabilia and trading cards"
  },
  {
    "id": "1078",
    "label": "Stamps",
    "tier1": "Collectables and Antiques",
    "tier2": "Stamps",
    "tier3": "",
    "keywords": "stamps"
  },
  {
    "id": "1079",
    "label": "Computer Software",
    "tier1": "Computer Software",
    "tier2": "",
    "tier3": "",
    "keywords": "computer software"
  },
  {
    "id": "1080",
    "label": "Enterprise Computer Software",
    "tier1": "Computer Software",
    "tier2": "Enterprise Computer Software",
    "tier3": "",
    "keywords": "enterprise computer software"
  },
  {
    "id": "1081",
    "label": "Personal Computer Software",
    "tier1": "Computer Software",
    "tier2": "Personal Computer Software",
    "tier3": "",
    "keywords": "personal computer software"
  },
  {
    "id": "1082",
    "label": "Cosmetic Services",
    "tier1": "Cosmetic Services",
    "tier2": "",
    "tier3": "",
    "keywords": "cosmetic services"
  },
  {
    "id": "1083",
    "label": "Beauty Salons",
    "tier1": "Cosmetic Services",
    "tier2": "Beauty Salons",
    "tier3": "",
    "keywords": "beauty salons"
  },
  {
    "id": "1084",
    "label": "Hair Salons",
    "tier1": "Cosmetic Services",
    "tier2": "Hair Salons",
    "tier3": "",
    "keywords": "hair salons"
  },
  {
    "id": "1085",
    "label": "Hair Removal",
    "tier1": "Cosmetic Services",
    "tier2": "Hair Removal",
    "tier3": "",
    "keywords": "hair removal"
  },
  {
    "id": "1086",
    "label": "Hair Restoration",
    "tier1": "Cosmetic Services",
    "tier2": "Hair Restoration",
    "tier3": "",
    "keywords": "hair restoration"
  },
  {
    "id": "1087",
    "label": "Nail Salons",
    "tier1": "Cosmetic Services",
    "tier2": "Nail Salons",
    "tier3": "",
    "keywords": "nail salons"
  },
  {
    "id": "1088",
    "label": "Med Spas",
    "tier1": "Cosmetic Services",
    "tier2": "Med Spas",
    "tier3": "",
    "keywords": "med spas"
  },
  {
    "id": "1089",
    "label": "Piercing and Tattooing",
    "tier1": "Cosmetic Services",
    "tier2": "Piercing and Tattooing",
    "tier3": "",
    "keywords": "piercing and tattooing"
  },
  {
    "id": "1090",
    "label": "Tanning Salons",
    "tier1": "Cosmetic Services",
    "tier2": "Tanning Salons",
    "tier3": "",
    "keywords": "tanning salons"
  },
  {
    "id": "1091",
    "label": "Consumer Electronics",
    "tier1": "Consumer Electronics",
    "tier2": "",
    "tier3": "",
    "keywords": "consumer electronics"
  },
  {
    "id": "1092",
    "label": "Arcade Equipment",
    "tier1": "Consumer Electronics",
    "tier2": "Arcade Equipment",
    "tier3": "",
    "keywords": "arcade equipment"
  },
  {
    "id": "1093",
    "label": "Camcorders",
    "tier1": "Consumer Electronics",
    "tier2": "Camcorders",
    "tier3": "",
    "keywords": "camcorders"
  },
  {
    "id": "1094",
    "label": "Cameras and Photo",
    "tier1": "Consumer Electronics",
    "tier2": "Cameras and Photo",
    "tier3": "",
    "keywords": "cameras and photo"
  },
  {
    "id": "1095",
    "label": "Camera and Photo Accessories",
    "tier1": "Consumer Electronics",
    "tier2": "Cameras and Photo",
    "tier3": "Camera and Photo Accessories",
    "keywords": "camera and photo accessories"
  },
  {
    "id": "1096",
    "label": "Cameras",
    "tier1": "Consumer Electronics",
    "tier2": "Cameras and Photo",
    "tier3": "Cameras",
    "keywords": "cameras"
  },
  {
    "id": "1097",
    "label": "Photo Applications",
    "tier1": "Consumer Electronics",
    "tier2": "Cameras and Photo",
    "tier3": "Photo Applications",
    "keywords": "photo applications"
  },
  {
    "id": "1098",
    "label": "Circuit Boards and Components",
    "tier1": "Consumer Electronics",
    "tier2": "Circuit Boards and Components",
    "tier3": "",
    "keywords": "circuit boards and components"
  },
  {
    "id": "1099",
    "label": "Communications Electronics",
    "tier1": "Consumer Electronics",
    "tier2": "Communications Electronics",
    "tier3": "",
    "keywords": "communications electronics"
  },
  {
    "id": "1100",
    "label": "Computers",
    "tier1": "Consumer Electronics",
    "tier2": "Computers",
    "tier3": "",
    "keywords": "computers"
  },
  {
    "id": "1101",
    "label": "Laptops",
    "tier1": "Consumer Electronics",
    "tier2": "Computers",
    "tier3": "Laptops",
    "keywords": "laptops"
  },
  {
    "id": "1102",
    "label": "Desktops",
    "tier1": "Consumer Electronics",
    "tier2": "Computers",
    "tier3": "Desktops",
    "keywords": "desktops"
  },
  {
    "id": "1103",
    "label": "E-Readers",
    "tier1": "Consumer Electronics",
    "tier2": "E-Readers",
    "tier3": "",
    "keywords": "e-readers"
  },
  {
    "id": "1104",
    "label": "Electronics Accessories",
    "tier1": "Consumer Electronics",
    "tier2": "Electronics Accessories",
    "tier3": "",
    "keywords": "electronics accessories"
  },
  {
    "id": "1105",
    "label": "Headphones",
    "tier1": "Consumer Electronics",
    "tier2": "Headphones",
    "tier3": "",
    "keywords": "headphones"
  },
  {
    "id": "1106",
    "label": "Home Theater Systems",
    "tier1": "Consumer Electronics",
    "tier2": "Home Theater Systems",
    "tier3": "",
    "keywords": "home theater systems"
  },
  {
    "id": "1107",
    "label": "Marine Electronics",
    "tier1": "Consumer Electronics",
    "tier2": "Marine Electronics",
    "tier3": "",
    "keywords": "marine electronics"
  },
  {
    "id": "1108",
    "label": "Mobile Phones and Accessories",
    "tier1": "Consumer Electronics",
    "tier2": "Mobile Phones and Accessories",
    "tier3": "",
    "keywords": "mobile phones and accessories"
  },
  {
    "id": "1109",
    "label": "Networking",
    "tier1": "Consumer Electronics",
    "tier2": "Networking",
    "tier3": "",
    "keywords": "networking"
  },
  {
    "id": "1110",
    "label": "Printers/Copiers/Scanners/Fax",
    "tier1": "Consumer Electronics",
    "tier2": "Printers/Copiers/Scanners/Fax",
    "tier3": "",
    "keywords": "printers/copiers/scanners/fax"
  },
  {
    "id": "1111",
    "label": "Security Devices",
    "tier1": "Consumer Electronics",
    "tier2": "Security Devices",
    "tier3": "",
    "keywords": "security devices"
  },
  {
    "id": "1112",
    "label": "Tablets",
    "tier1": "Consumer Electronics",
    "tier2": "Tablets",
    "tier3": "",
    "keywords": "tablets"
  },
  {
    "id": "1113",
    "label": "Televisions",
    "tier1": "Consumer Electronics",
    "tier2": "Televisions",
    "tier3": "",
    "keywords": "televisions"
  },
  {
    "id": "1114",
    "label": "Video Games and Consoles",
    "tier1": "Consumer Electronics",
    "tier2": "Video Games",
    "tier3": "",
    "keywords": "video games and consoles"
  },
  {
    "id": "1115",
    "label": "Video Games and Consoles",
    "tier1": "Consumer Electronics",
    "tier2": "Video Game Consoles",
    "tier3": "",
    "keywords": "video games and consoles"
  },
  {
    "id": "1116",
    "label": "Video Game Console Accessories",
    "tier1": "Consumer Electronics",
    "tier2": "Video Game Console Accessories",
    "tier3": "",
    "keywords": "video game console accessories"
  },
  {
    "id": "1117",
    "label": "Consumer Packaged Goods",
    "tier1": "Consumer Packaged Goods",
    "tier2": "",
    "tier3": "",
    "keywords": "consumer packaged goods"
  },
  {
    "id": "1118",
    "label": "Baby and Toddler Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Baby and Toddler Products",
    "tier3": "",
    "keywords": "baby and toddler products"
  },
  {
    "id": "1119",
    "label": "Diapers",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Baby and Toddler Products",
    "tier3": "Diapers",
    "keywords": "diapers"
  },
  {
    "id": "1120",
    "label": "Nursing and Feeding Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Baby and Toddler Products",
    "tier3": "Nursing and Feeding Products",
    "keywords": "nursing and feeding products"
  },
  {
    "id": "1121",
    "label": "Back to School Supplies",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Back to School Supplies",
    "tier3": "",
    "keywords": "back to school supplies"
  },
  {
    "id": "1122",
    "label": "Barbeque",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Barbeque",
    "tier3": "",
    "keywords": "barbeque"
  },
  {
    "id": "1123",
    "label": "Charcoal",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Barbeque",
    "tier3": "Charcoal",
    "keywords": "charcoal"
  },
  {
    "id": "1124",
    "label": "Charcoal Lighter Fluids",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Barbeque",
    "tier3": "Charcoal Lighter Fluids",
    "keywords": "charcoal lighter fluids"
  },
  {
    "id": "1125",
    "label": "Beverages",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "",
    "keywords": "beverages"
  },
  {
    "id": "1126",
    "label": "Carbonated Soft Drinks",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "Carbonated Soft Drinks",
    "keywords": "carbonated soft drinks"
  },
  {
    "id": "1127",
    "label": "Coffee & Tea",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "Coffee & Tea",
    "keywords": "coffee & tea"
  },
  {
    "id": "1128",
    "label": "Drink Mixes",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "Drink Mixes",
    "keywords": "drink mixes"
  },
  {
    "id": "1129",
    "label": "Juices",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "Juices",
    "keywords": "juices"
  },
  {
    "id": "1130",
    "label": "Sports/Energy Drinks",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "Sports/Energy Drinks",
    "keywords": "sports/energy drinks"
  },
  {
    "id": "1131",
    "label": "Water",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Beverages",
    "tier3": "Water",
    "keywords": "water"
  },
  {
    "id": "1132",
    "label": "Cosmetics",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "",
    "keywords": "cosmetics"
  },
  {
    "id": "1133",
    "label": "Cosmetics Accessories",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "Cosmetics Accessories",
    "keywords": "cosmetics accessories,pads"
  },
  {
    "id": "1134",
    "label": "Cosmetics-Nail",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "Cosmetics-Nail",
    "keywords": "cosmetics-nail"
  },
  {
    "id": "1135",
    "label": "Eye",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "Eye",
    "keywords": "eye"
  },
  {
    "id": "1136",
    "label": "Facial",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "Facial",
    "keywords": "facial"
  },
  {
    "id": "1137",
    "label": "Lip",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "Lip",
    "keywords": "lip"
  },
  {
    "id": "1138",
    "label": "Storage",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Cosmetics",
    "tier3": "Storage",
    "keywords": "storage"
  },
  {
    "id": "1139",
    "label": "Disposable Tableware",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Disposable Tableware",
    "tier3": "",
    "keywords": "disposable tableware"
  },
  {
    "id": "1140",
    "label": "Cups & Plates",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Disposable Tableware",
    "tier3": "Cups & Plates",
    "keywords": "cups & plates"
  },
  {
    "id": "1141",
    "label": "Disposable Tableware",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Disposable Tableware",
    "tier3": "Disposable Tableware",
    "keywords": "disposable tableware"
  },
  {
    "id": "1142",
    "label": "Foils, Wraps, & Bags",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Foils, Wraps, & Bags",
    "tier3": "",
    "keywords": "foils, wraps, & bags"
  },
  {
    "id": "1143",
    "label": "Foil Pans",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Foils, Wraps, & Bags",
    "tier3": "Foil Pans",
    "keywords": "foil pans"
  },
  {
    "id": "1144",
    "label": "Foils & Wraps",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Foils, Wraps, & Bags",
    "tier3": "Foils & Wraps",
    "keywords": "foils & wraps"
  },
  {
    "id": "1145",
    "label": "Food & Trash Bags",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Foils, Wraps, & Bags",
    "tier3": "Food & Trash Bags",
    "keywords": "food & trash bags"
  },
  {
    "id": "1146",
    "label": "Fragrance",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Fragrance",
    "tier3": "",
    "keywords": "fragrance"
  },
  {
    "id": "1147",
    "label": "Fragrances - Women's",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Fragrance",
    "tier3": "Fragrances - Women's",
    "keywords": "fragrances - women's"
  },
  {
    "id": "1148",
    "label": "Shaving Lotion/Men's Fragrance",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Fragrance",
    "tier3": "Shaving Lotion/Men's Fragrance",
    "keywords": "shaving lotion/men's fragrance"
  },
  {
    "id": "1149",
    "label": "Frozen",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "",
    "keywords": "frozen"
  },
  {
    "id": "1150",
    "label": "Frozen Baked Goods",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Baked Goods",
    "keywords": "frozen baked goods"
  },
  {
    "id": "1151",
    "label": "Frozen Beverages",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Beverages",
    "keywords": "frozen beverages, slushie"
  },
  {
    "id": "1152",
    "label": "Frozen Desserts",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Desserts",
    "keywords": "frozen desserts, ice cream"
  },
  {
    "id": "1153",
    "label": "Frozen Fruits & Vegetables",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Fruits & Vegetables",
    "keywords": "frozen fruits & vegetables"
  },
  {
    "id": "1154",
    "label": "Frozen Juices",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Juices",
    "keywords": "frozen juices"
  },
  {
    "id": "1155",
    "label": "Frozen Meals",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Meals",
    "keywords": "frozen meals"
  },
  {
    "id": "1156",
    "label": "Frozen Meat/Poultry/Seafood",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Meat/Poultry/Seafood",
    "keywords": "frozen meat/poultry/seafood"
  },
  {
    "id": "1157",
    "label": "Frozen Snacks",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Frozen Snacks",
    "keywords": "frozen snacks"
  },
  {
    "id": "1158",
    "label": "Other Frozen",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Frozen",
    "tier3": "Other Frozen",
    "keywords": "other frozen"
  },
  {
    "id": "1159",
    "label": "General Food",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "",
    "keywords": "general food"
  },
  {
    "id": "1160",
    "label": "Baby Food",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Baby Food",
    "keywords": "baby food"
  },
  {
    "id": "1161",
    "label": "Bakery",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Bakery",
    "keywords": "bakery"
  },
  {
    "id": "1162",
    "label": "Baking",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Baking",
    "keywords": "baking"
  },
  {
    "id": "1163",
    "label": "Breakfast",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Breakfast",
    "keywords": "breakfast"
  },
  {
    "id": "1164",
    "label": "Candy",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Candy",
    "keywords": "candy"
  },
  {
    "id": "1165",
    "label": "Condiments & Sauces",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Condiments & Sauces",
    "keywords": "condiments & sauces"
  },
  {
    "id": "1166",
    "label": "Cookies & Crackers",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Cookies & Crackers",
    "keywords": "cookies & crackers"
  },
  {
    "id": "1167",
    "label": "Fruit",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Fruit",
    "keywords": "fruit"
  },
  {
    "id": "1168",
    "label": "Meals",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Meals",
    "keywords": "meals"
  },
  {
    "id": "1169",
    "label": "Snacks",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Snacks",
    "keywords": "snacks"
  },
  {
    "id": "1170",
    "label": "Vegetables",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Food",
    "tier3": "Vegetables",
    "keywords": "vegetables"
  },
  {
    "id": "1171",
    "label": "General Merchandise",
    "tier1": "Consumer Packaged Goods",
    "tier2": "General Merchandise",
    "tier3": "",
    "keywords": "general merchandise"
  },
  {
    "id": "1172",
    "label": "Grooming Supplies",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Grooming Supplies",
    "tier3": "",
    "keywords": "grooming supplies"
  },
  {
    "id": "1173",
    "label": "Hair Care",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "",
    "keywords": "hair care"
  },
  {
    "id": "1174",
    "label": "Hair Accessories",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Hair Accessories",
    "keywords": "hair accessories"
  },
  {
    "id": "1175",
    "label": "Hair Coloring",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Hair Coloring",
    "keywords": "hair coloring"
  },
  {
    "id": "1176",
    "label": "Hair Conditioner",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Hair Conditioner",
    "keywords": "hair conditioner"
  },
  {
    "id": "1177",
    "label": "Hair Growth Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Hair Growth Products",
    "keywords": "hair growth products"
  },
  {
    "id": "1178",
    "label": "Hair Spray/Spritz",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Hair Spray/Spritz",
    "keywords": "hair spray/spritz"
  },
  {
    "id": "1179",
    "label": "Hair Styling Gel/Mousse",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Hair Styling Gel/Mousse",
    "keywords": "hair styling gel/mousse"
  },
  {
    "id": "1180",
    "label": "Home Permanent/Relaxer Kits",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Home Permanent/Relaxer Kits",
    "keywords": "home permanent/relaxer kits"
  },
  {
    "id": "1181",
    "label": "Shampoo",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hair Care",
    "tier3": "Shampoo",
    "keywords": "shampoo"
  },
  {
    "id": "1182",
    "label": "HFSS Products [High Fat, Sugar, Salt]",
    "tier1": "Consumer Packaged Goods",
    "tier2": "HFSS Products [High Fat, Sugar, Salt]",
    "tier3": "",
    "keywords": "hfss products [high fat, sugar, salt]"
  },
  {
    "id": "1183",
    "label": "Home Care",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Home Care",
    "tier3": "",
    "keywords": "home care"
  },
  {
    "id": "1184",
    "label": "Household Cleaning",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Home Care",
    "tier3": "Household Cleaning",
    "keywords": "household cleaning"
  },
  {
    "id": "1185",
    "label": "Laundry",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Home Care",
    "tier3": "Laundry",
    "keywords": "laundry"
  },
  {
    "id": "1186",
    "label": "Hosiery",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hosiery",
    "tier3": "",
    "keywords": "hosiery"
  },
  {
    "id": "1187",
    "label": "Pantyhose/Nylons",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hosiery",
    "tier3": "Pantyhose/Nylons",
    "keywords": "pantyhose/nylons"
  },
  {
    "id": "1188",
    "label": "Socks",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hosiery",
    "tier3": "Socks",
    "keywords": "socks"
  },
  {
    "id": "1189",
    "label": "Tights",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Hosiery",
    "tier3": "Tights",
    "keywords": "tights"
  },
  {
    "id": "1190",
    "label": "Household/Plastics/Storage",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Household/Plastics/Storage",
    "tier3": "",
    "keywords": "household/plastics/storage"
  },
  {
    "id": "1191",
    "label": "Bottles",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Household/Plastics/Storage",
    "tier3": "Bottles",
    "keywords": "bottles"
  },
  {
    "id": "1192",
    "label": "Drinkware",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Household/Plastics/Storage",
    "tier3": "Drinkware",
    "keywords": "drinkware"
  },
  {
    "id": "1193",
    "label": "Household Plastics",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Household/Plastics/Storage",
    "tier3": "Household Plastics",
    "keywords": "household plastics"
  },
  {
    "id": "1194",
    "label": "Kitchen Storage",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Household/Plastics/Storage",
    "tier3": "Kitchen Storage",
    "keywords": "kitchen storage"
  },
  {
    "id": "1195",
    "label": "Meal Kits",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Meal Kits",
    "tier3": "",
    "keywords": "meal kits"
  },
  {
    "id": "1196",
    "label": "Miscellaneous General Merch",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Miscellaneous General Merch",
    "tier3": "",
    "keywords": "miscellaneous general merch"
  },
  {
    "id": "1197",
    "label": "Office/School Supplies",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Office/School Supplies",
    "tier3": "",
    "keywords": "office/school supplies"
  },
  {
    "id": "1198",
    "label": "Children's Art Supplies",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Office/School Supplies",
    "tier3": "Children's Art Supplies",
    "keywords": "children's art supplies"
  },
  {
    "id": "1199",
    "label": "Computer Disks Frmtd/UnFrmtd",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Office/School Supplies",
    "tier3": "Computer Disks Frmtd/UnFrmtd",
    "keywords": "computer disks frmtd/unfrmtd"
  },
  {
    "id": "1200",
    "label": "Office Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Office/School Supplies",
    "tier3": "Office Products",
    "keywords": "office products"
  },
  {
    "id": "1201",
    "label": "Writing Instruments",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Office/School Supplies",
    "tier3": "Writing Instruments",
    "keywords": "writing instruments"
  },
  {
    "id": "1202",
    "label": "Over the Counter Medication",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Over the Counter Medication",
    "tier3": "",
    "keywords": "over the counter medication"
  },
  {
    "id": "1203",
    "label": "Paper Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Paper Products",
    "tier3": "",
    "keywords": "paper products"
  },
  {
    "id": "1204",
    "label": "Facial Tissue",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Paper Products",
    "tier3": "Facial Tissue",
    "keywords": "facial tissue"
  },
  {
    "id": "1205",
    "label": "Paper Napkins",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Paper Products",
    "tier3": "Paper Napkins",
    "keywords": "paper napkins"
  },
  {
    "id": "1206",
    "label": "Paper Towels",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Paper Products",
    "tier3": "Paper Towels",
    "keywords": "paper towels"
  },
  {
    "id": "1207",
    "label": "Toilet Tissue",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Paper Products",
    "tier3": "Toilet Tissue",
    "keywords": "toilet tissue"
  },
  {
    "id": "1208",
    "label": "Personal Cleansing",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Personal Cleansing",
    "tier3": "",
    "keywords": "personal cleansing"
  },
  {
    "id": "1209",
    "label": "Bath Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Personal Cleansing",
    "tier3": "Bath Products",
    "keywords": "bath products"
  },
  {
    "id": "1210",
    "label": "Bath/Body Scrubbers/Massagers",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Personal Cleansing",
    "tier3": "Bath/Body Scrubbers/Massagers",
    "keywords": "bath/body scrubbers/massagers"
  },
  {
    "id": "1211",
    "label": "Deodorant",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Personal Cleansing",
    "tier3": "Deodorant",
    "keywords": "deodorant"
  },
  {
    "id": "1212",
    "label": "Moist Towelettes",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Personal Cleansing",
    "tier3": "Moist Towelettes",
    "keywords": "moist towelettes"
  },
  {
    "id": "1213",
    "label": "Soap",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Personal Cleansing",
    "tier3": "Soap",
    "keywords": "soap"
  },
  {
    "id": "1214",
    "label": "Pest Control",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pest Control",
    "tier3": "",
    "keywords": "pest control"
  },
  {
    "id": "1215",
    "label": "Outdoor Insect/Rodent Control Chem",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pest Control",
    "tier3": "Outdoor Insect/Rodent Control Chem",
    "keywords": "outdoor insect/rodent control chem"
  },
  {
    "id": "1216",
    "label": "Pest Control",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pest Control",
    "tier3": "Pest Control",
    "keywords": "pest control"
  },
  {
    "id": "1217",
    "label": "Pet Care",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pet Care",
    "tier3": "",
    "keywords": "pet care"
  },
  {
    "id": "1218",
    "label": "Cat/Dog Litter",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pet Care",
    "tier3": "Cat/Dog Litter",
    "keywords": "cat/dog litter"
  },
  {
    "id": "1219",
    "label": "Pet Food",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pet Care",
    "tier3": "Pet Food",
    "keywords": "pet food"
  },
  {
    "id": "1220",
    "label": "Pet Supplies",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pet Care",
    "tier3": "Pet Supplies",
    "keywords": "pet supplies"
  },
  {
    "id": "1221",
    "label": "Pet Treats",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Pet Care",
    "tier3": "Pet Treats",
    "keywords": "pet treats"
  },
  {
    "id": "1222",
    "label": "Refrigerated",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "",
    "keywords": "refrigerated"
  },
  {
    "id": "1223",
    "label": "Dairy",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Dairy",
    "keywords": "dairy"
  },
  {
    "id": "1224",
    "label": "Refrigerated Baked Goods",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Baked Goods",
    "keywords": "refrigerated baked goods"
  },
  {
    "id": "1225",
    "label": "Refrigerated Beverages",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Beverages",
    "keywords": "refrigerated beverages"
  },
  {
    "id": "1226",
    "label": "Refrigerated Condiments",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Condiments",
    "keywords": "refrigerated condiments"
  },
  {
    "id": "1227",
    "label": "Refrigerated Desserts",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Desserts",
    "keywords": "refrigerated desserts"
  },
  {
    "id": "1228",
    "label": "Refrigerated Dough",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Dough",
    "keywords": "refrigerated dough"
  },
  {
    "id": "1229",
    "label": "Refrigerated Meals",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Meals",
    "keywords": "refrigerated meals"
  },
  {
    "id": "1230",
    "label": "Refrigerated Meats",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Meats",
    "keywords": "refrigerated meats"
  },
  {
    "id": "1231",
    "label": "Refrigerated Miscellaneous",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Refrigerated",
    "tier3": "Refrigerated Miscellaneous",
    "keywords": "refrigerated miscellaneous"
  },
  {
    "id": "1232",
    "label": "Religious Items",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Religious Items",
    "tier3": "",
    "keywords": "religious items"
  },
  {
    "id": "1233",
    "label": "Shaving",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Shaving",
    "tier3": "",
    "keywords": "shaving"
  },
  {
    "id": "1234",
    "label": "Blades",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Shaving",
    "tier3": "Blades",
    "keywords": "blades"
  },
  {
    "id": "1235",
    "label": "Razors",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Shaving",
    "tier3": "Razors",
    "keywords": "razors"
  },
  {
    "id": "1236",
    "label": "Shaving Cream",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Shaving",
    "tier3": "Shaving Cream",
    "keywords": "shaving cream"
  },
  {
    "id": "1237",
    "label": "Skin Care",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Skin Care",
    "tier3": "",
    "keywords": "skin care"
  },
  {
    "id": "1238",
    "label": "Hand & Body Lotion",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Skin Care",
    "tier3": "Hand & Body Lotion",
    "keywords": "hand & body lotion"
  },
  {
    "id": "1239",
    "label": "Skin Care",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Skin Care",
    "tier3": "Skin Care",
    "keywords": "skin care"
  },
  {
    "id": "1240",
    "label": "Suntan Products",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Skin Care",
    "tier3": "Suntan Products",
    "keywords": "suntan products"
  },
  {
    "id": "1241",
    "label": "Toys and Games",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Toys and Games",
    "tier3": "",
    "keywords": "toys and games"
  },
  {
    "id": "1242",
    "label": "Games",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Toys and Games",
    "tier3": "Games",
    "keywords": "games"
  },
  {
    "id": "1243",
    "label": "Outdoor Play Equipment",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Toys and Games",
    "tier3": "Outdoor Play Equipment",
    "keywords": "outdoor play equipment"
  },
  {
    "id": "1244",
    "label": "Puzzles",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Toys and Games",
    "tier3": "Puzzles",
    "keywords": "puzzles"
  },
  {
    "id": "1245",
    "label": "Toys",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Toys and Games",
    "tier3": "Toys",
    "keywords": "toys"
  },
  {
    "id": "1246",
    "label": "Vitamins and Supplements",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Vitamins and Supplements",
    "tier3": "",
    "keywords": "vitamins and supplements"
  },
  {
    "id": "1247",
    "label": "Digestive Supplements",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Vitamins and Supplements",
    "tier3": "Digestive Supplements",
    "keywords": "digestive supplements"
  },
  {
    "id": "1248",
    "label": "Weightloss Supplements",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Vitamins and Supplements",
    "tier3": "Weightloss Supplements",
    "keywords": "weightloss supplements"
  },
  {
    "id": "1249",
    "label": "Water Treatment",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Water Treatment",
    "tier3": "",
    "keywords": "water treatment"
  },
  {
    "id": "1250",
    "label": "Water Filter/Devices",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Water Treatment",
    "tier3": "Water Filter/Devices",
    "keywords": "water filter/devices"
  },
  {
    "id": "1251",
    "label": "Water Softeners/Treatment",
    "tier1": "Consumer Packaged Goods",
    "tier2": "Water Treatment",
    "tier3": "Water Softeners/Treatment",
    "keywords": "water softeners/treatment"
  },
  {
    "id": "1252",
    "label": "Durable Goods",
    "tier1": "Durable Goods",
    "tier2": "",
    "tier3": "",
    "keywords": "durable goods"
  },
  {
    "id": "1253",
    "label": "Electronics/Photography",
    "tier1": "Durable Goods",
    "tier2": "Electronics/Photography",
    "tier3": "",
    "keywords": "electronics/photography"
  },
  {
    "id": "1254",
    "label": "Batteries",
    "tier1": "Durable Goods",
    "tier2": "Electronics/Photography",
    "tier3": "Batteries",
    "keywords": "batteries"
  },
  {
    "id": "1255",
    "label": "Blank Audio/Video Media",
    "tier1": "Durable Goods",
    "tier2": "Electronics/Photography",
    "tier3": "Blank Audio/Video Media",
    "keywords": "blank audio/video media"
  },
  {
    "id": "1256",
    "label": "Photography Supplies",
    "tier1": "Durable Goods",
    "tier2": "Electronics/Photography",
    "tier3": "Photography Supplies",
    "keywords": "photography supplies"
  },
  {
    "id": "1257",
    "label": "Furniture",
    "tier1": "Durable Goods",
    "tier2": "Furniture",
    "tier3": "",
    "keywords": "furniture"
  },
  {
    "id": "1258",
    "label": "Indoor Furniture",
    "tier1": "Durable Goods",
    "tier2": "Furniture",
    "tier3": "Indoor Furniture",
    "keywords": "indoor furniture"
  },
  {
    "id": "1259",
    "label": "Outdoor Furniture",
    "tier1": "Durable Goods",
    "tier2": "Furniture",
    "tier3": "Outdoor Furniture",
    "keywords": "outdoor furniture"
  },
  {
    "id": "1260",
    "label": "Grooming Supplies",
    "tier1": "Durable Goods",
    "tier2": "Grooming Supplies",
    "tier3": "",
    "keywords": "grooming supplies"
  },
  {
    "id": "1262",
    "label": "Hair Appliances",
    "tier1": "Durable Goods",
    "tier2": "Grooming Supplies",
    "tier3": "Hair Appliances",
    "keywords": "hair appliances"
  },
  {
    "id": "1264",
    "label": "Consumer Hardware Supplies",
    "tier1": "Durable Goods",
    "tier2": "Tools and Hardware",
    "tier3": "Consumer Hardware Supplies",
    "keywords": "consumer hardware supplies"
  },
  {
    "id": "1265",
    "label": "Industrial Hardware Supplies",
    "tier1": "Durable Goods",
    "tier2": "Tools and Hardware",
    "tier3": "Industrial Hardware Supplies",
    "keywords": "industrial hardware supplies"
  },
  {
    "id": "1261",
    "label": "Electric Shaver Groomer",
    "tier1": "Durable Goods",
    "tier2": "Grooming Supplies",
    "tier3": "Electric Shaver Groomer",
    "keywords": "electric shaver groomer"
  },
  {
    "id": "1263",
    "label": "Tools and Hardware",
    "tier1": "Durable Goods",
    "tier2": "Tools and Hardware",
    "tier3": "",
    "keywords": "tools and hardware"
  },
  {
    "id": "1266",
    "label": "Home and Garden Products",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "",
    "keywords": "home and garden products"
  },
  {
    "id": "1267",
    "label": "Bathroom Accessories",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Bathroom Accessories",
    "keywords": "bathroom accessories"
  },
  {
    "id": "1268",
    "label": "Bedroom Furniture and Accessories",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Bedroom Furniture and Accessories",
    "keywords": "bedroom furniture and accessories"
  },
  {
    "id": "1269",
    "label": "Carpets and Rugs",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Carpets and Rugs",
    "keywords": "carpets and rugs"
  },
  {
    "id": "1270",
    "label": "Fireplaces",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Fireplaces",
    "keywords": "fireplaces"
  },
  {
    "id": "1271",
    "label": "Home Decor",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Home Decor",
    "keywords": "home decor"
  },
  {
    "id": "1272",
    "label": "Housewares",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Housewares",
    "keywords": "housewares"
  },
  {
    "id": "1273",
    "label": "Kitchen and Dining Products",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Kitchen and Dining Products",
    "keywords": "kitchen and dining products"
  },
  {
    "id": "1274",
    "label": "Lawn and Garden Products",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Lawn and Garden Products",
    "keywords": "lawn and garden products"
  },
  {
    "id": "1275",
    "label": "Lighting",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Lighting",
    "keywords": "lighting"
  },
  {
    "id": "1276",
    "label": "Linens and Bedding",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Linens and Bedding",
    "keywords": "linens and bedding"
  },
  {
    "id": "1277",
    "label": "Plants",
    "tier1": "Durable Goods",
    "tier2": "Home and Garden Products",
    "tier3": "Plants",
    "keywords": "plants"
  },
  {
    "id": "1278",
    "label": "Household Appliances",
    "tier1": "Durable Goods",
    "tier2": "Household Appliances",
    "tier3": "",
    "keywords": "household appliances"
  },
  {
    "id": "1279",
    "label": "Luggage and Bags",
    "tier1": "Durable Goods",
    "tier2": "Luggage and Bags",
    "tier3": "",
    "keywords": "luggage and bags"
  },
  {
    "id": "1280",
    "label": "Dieting and Weightloss",
    "tier1": "Dieting and Weightloss",
    "tier2": "",
    "tier3": "",
    "keywords": "dieting and weightloss"
  },
  {
    "id": "1281",
    "label": "Food Logging",
    "tier1": "Dieting and Weightloss",
    "tier2": "Food Logging",
    "tier3": "",
    "keywords": "food logging"
  },
  {
    "id": "1282",
    "label": "Weightloss Services",
    "tier1": "Dieting and Weightloss",
    "tier2": "Weightloss Servies",
    "tier3": "",
    "keywords": "weightloss servies"
  },
  {
    "id": "1283",
    "label": "Workout and Step Tracking Applications",
    "tier1": "Dieting and Weightloss",
    "tier2": "Workout and Step Tracking Applications",
    "tier3": "",
    "keywords": "workout and step tracking applications"
  },
  {
    "id": "1284",
    "label": "Education and Careers",
    "tier1": "Education and Careers",
    "tier2": "",
    "tier3": "",
    "keywords": "education and careers"
  },
  {
    "id": "1285",
    "label": "Adult Education",
    "tier1": "Education and Careers",
    "tier2": "Adult Education",
    "tier3": "",
    "keywords": "adult education"
  },
  {
    "id": "1286",
    "label": "Certificaiton Programs",
    "tier1": "Education and Careers",
    "tier2": "Certificaiton Programs",
    "tier3": "",
    "keywords": "certificaiton programs"
  },
  {
    "id": "1287",
    "label": "Colleges and Universities",
    "tier1": "Education and Careers",
    "tier2": "Colleges and Universities",
    "tier3": "",
    "keywords": "colleges and universities"
  },
  {
    "id": "1288",
    "label": "Post-Graduate Education",
    "tier1": "Education and Careers",
    "tier2": "Colleges and Universities",
    "tier3": "Post-Graduate Education",
    "keywords": "post-graduate education"
  },
  {
    "id": "1289",
    "label": "Education Applications",
    "tier1": "Education and Careers",
    "tier2": "Education Applications",
    "tier3": "",
    "keywords": "education applications"
  },
  {
    "id": "1290",
    "label": "Employment Agencies",
    "tier1": "Education and Careers",
    "tier2": "Employment Agencies",
    "tier3": "",
    "keywords": "employment agencies"
  },
  {
    "id": "1291",
    "label": "Higher Education",
    "tier1": "Education and Careers",
    "tier2": "Higher Education",
    "tier3": "",
    "keywords": "higher education"
  },
  {
    "id": "1292",
    "label": "Language Learning",
    "tier1": "Education and Careers",
    "tier2": "Language Learning",
    "tier3": "",
    "keywords": "language learning"
  },
  {
    "id": "1293",
    "label": "Online Education",
    "tier1": "Education and Careers",
    "tier2": "Online Education",
    "tier3": "",
    "keywords": "online education"
  },
  {
    "id": "1294",
    "label": "Primary Education",
    "tier1": "Education and Careers",
    "tier2": "Primary Education",
    "tier3": "",
    "keywords": "primary education"
  },
  {
    "id": "1295",
    "label": "Remote work and school",
    "tier1": "Education and Careers",
    "tier2": "Remote work and school",
    "tier3": "",
    "keywords": "remote work and school"
  },
  {
    "id": "1296",
    "label": "Distance learning",
    "tier1": "Education and Careers",
    "tier2": "Remote work and school",
    "tier3": "Distance learning",
    "keywords": "distance learning"
  },
  {
    "id": "1297",
    "label": "Homeschooling",
    "tier1": "Education and Careers",
    "tier2": "Remote work and school",
    "tier3": "Homeschooling",
    "keywords": "homeschooling"
  },
  {
    "id": "1298",
    "label": "Telecommuting",
    "tier1": "Education and Careers",
    "tier2": "Remote work and school",
    "tier3": "Telecommuting",
    "keywords": "telecommuting"
  },
  {
    "id": "1299",
    "label": "Study Skills",
    "tier1": "Education and Careers",
    "tier2": "Study Skills",
    "tier3": "",
    "keywords": "study skills"
  },
  {
    "id": "1300",
    "label": "Teaching Resources",
    "tier1": "Education and Careers",
    "tier2": "Teaching Resources",
    "tier3": "",
    "keywords": "teaching resources"
  },
  {
    "id": "1301",
    "label": "Trade Schools",
    "tier1": "Education and Careers",
    "tier2": "Trade Schools",
    "tier3": "",
    "keywords": "trade schools"
  },
  {
    "id": "1302",
    "label": "Events and Performances",
    "tier1": "Events and Performances",
    "tier2": "",
    "tier3": "",
    "keywords": "events and performances, funeral, cremation"
  },
  {
    "id": "1303",
    "label": "Auctions",
    "tier1": "Events and Performances",
    "tier2": "Auctions",
    "tier3": "",
    "keywords": "auctions"
  },
  {
    "id": "1304",
    "label": "Cinemas and Movie Events",
    "tier1": "Events and Performances",
    "tier2": "Cinemas and Movie Events",
    "tier3": "",
    "keywords": "cinemas and movie events"
  },
  {
    "id": "1305",
    "label": "Comedy Events",
    "tier1": "Events and Performances",
    "tier2": "Comedy Events",
    "tier3": "",
    "keywords": "comedy events, stand up comedy"
  },
  {
    "id": "1306",
    "label": "Concerts",
    "tier1": "Events and Performances",
    "tier2": "Concerts",
    "tier3": "",
    "keywords": "concerts"
  },
  {
    "id": "1307",
    "label": "Conferences, Lectures and Workshops",
    "tier1": "Events and Performances",
    "tier2": "Conferences, Lectures and Workshops",
    "tier3": "",
    "keywords": "conferences, lectures and workshops"
  },
  {
    "id": "1308",
    "label": "Exhibitions",
    "tier1": "Events and Performances",
    "tier2": "Exhibitions",
    "tier3": "",
    "keywords": "exhibitions"
  },
  {
    "id": "1309",
    "label": "Fan Conventions",
    "tier1": "Events and Performances",
    "tier2": "Fan Conventions",
    "tier3": "",
    "keywords": "fan conventions"
  },
  {
    "id": "1310",
    "label": "Fashion Events",
    "tier1": "Events and Performances",
    "tier2": "Fashion Events",
    "tier3": "",
    "keywords": "fashion events"
  },
  {
    "id": "1311",
    "label": "Nightlife Experiences",
    "tier1": "Events and Performances",
    "tier2": "Nightlife Experiences",
    "tier3": "",
    "keywords": "nightlife experiences"
  },
  {
    "id": "1312",
    "label": "Sporting Events",
    "tier1": "Events and Performances",
    "tier2": "Sporting Events",
    "tier3": "",
    "keywords": "sporting events"
  },
  {
    "id": "1313",
    "label": "Seasonal and Holiday Events",
    "tier1": "Events and Performances",
    "tier2": "Seasonal and Holiday Events",
    "tier3": "",
    "keywords": "seasonal and holiday events, amusement parks"
  },
  {
    "id": "1314",
    "label": "Theatre and Musicals",
    "tier1": "Events and Performances",
    "tier2": "Theatre and Musicals",
    "tier3": "",
    "keywords": "theatre and musicals"
  },
  {
    "id": "1315",
    "label": "Family and Parenting",
    "tier1": "Family and Parenting",
    "tier2": "",
    "tier3": "",
    "keywords": "family and parenting"
  },
  {
    "id": "1316",
    "label": "Childcare",
    "tier1": "Family and Parenting",
    "tier2": "Childcare",
    "tier3": "",
    "keywords": "childcare"
  },
  {
    "id": "1317",
    "label": "Day Care Centers",
    "tier1": "Family and Parenting",
    "tier2": "Childcare",
    "tier3": "Day Care Centers",
    "keywords": "day care centers"
  },
  {
    "id": "1318",
    "label": "Nanny Services",
    "tier1": "Family and Parenting",
    "tier2": "Childcare",
    "tier3": "Nanny Services",
    "keywords": "nanny services"
  },
  {
    "id": "1319",
    "label": "Genealogy and Family Trees",
    "tier1": "Family and Parenting",
    "tier2": "Genealogy and Family Trees",
    "tier3": "",
    "keywords": "genealogy and family trees"
  },
  {
    "id": "1320",
    "label": "Kids Activities",
    "tier1": "Family and Parenting",
    "tier2": "Kids Activities",
    "tier3": "",
    "keywords": "kids activities"
  },
  {
    "id": "1321",
    "label": "Senior Living",
    "tier1": "Family and Parenting",
    "tier2": "Senior Living",
    "tier3": "",
    "keywords": "senior living"
  },
  {
    "id": "1322",
    "label": "Finance and Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "",
    "tier3": "",
    "keywords": "finance and insurance"
  },
  {
    "id": "1323",
    "label": "Accountants and Bookkeepers",
    "tier1": "Finance and Insurance",
    "tier2": "Accountants and Bookkeepers",
    "tier3": "",
    "keywords": "accountants and bookkeepers"
  },
  {
    "id": "1324",
    "label": "Banking",
    "tier1": "Finance and Insurance",
    "tier2": "Banking",
    "tier3": "",
    "keywords": "banking"
  },
  {
    "id": "1325",
    "label": "Credit and Debt Repair/Credit Reporting",
    "tier1": "Finance and Insurance",
    "tier2": "Credit and Debt Repair/Credit Reporting",
    "tier3": "",
    "keywords": "credit and debt repair/credit reporting"
  },
  {
    "id": "1326",
    "label": "Credit Cards",
    "tier1": "Finance and Insurance",
    "tier2": "Credit Cards",
    "tier3": "",
    "keywords": "credit cards"
  },
  {
    "id": "1327",
    "label": "Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "",
    "keywords": "insurance"
  },
  {
    "id": "1328",
    "label": "Auto Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "Auto Insurance",
    "keywords": "auto insurance"
  },
  {
    "id": "1329",
    "label": "Home Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "Home Insurance",
    "keywords": "home insurance"
  },
  {
    "id": "1330",
    "label": "Life Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "Life Insurance",
    "keywords": "life insurance"
  },
  {
    "id": "1331",
    "label": "Medical Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "Medical Insurance",
    "keywords": "medical insurance"
  },
  {
    "id": "1332",
    "label": "Pet Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "Pet Insurance",
    "keywords": "pet insurance"
  },
  {
    "id": "1333",
    "label": "Travel Insurance",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance",
    "tier3": "Travel Insurance",
    "keywords": "travel insurance"
  },
  {
    "id": "1334",
    "label": "Insurance Coverage Apps",
    "tier1": "Finance and Insurance",
    "tier2": "Insurance Coverage Apps",
    "tier3": "",
    "keywords": "insurance coverage apps"
  },
  {
    "id": "1335",
    "label": "Mortgage Lenders and Brokers",
    "tier1": "Finance and Insurance",
    "tier2": "Mortgage Lenders and Brokers",
    "tier3": "",
    "keywords": "mortgage lenders and brokers"
  },
  {
    "id": "1336",
    "label": "Payday and Emergency Loans",
    "tier1": "Finance and Insurance",
    "tier2": "Payday and Emergency Loans",
    "tier3": "",
    "keywords": "payday and emergency loans"
  },
  {
    "id": "1337",
    "label": "Retirement Planning",
    "tier1": "Finance and Insurance",
    "tier2": "Retirement Planning",
    "tier3": "",
    "keywords": "retirement planning"
  },
  {
    "id": "1338",
    "label": "Stocks and Investments",
    "tier1": "Finance and Insurance",
    "tier2": "Stocks and Investments",
    "tier3": "",
    "keywords": "stocks and investments"
  },
  {
    "id": "1339",
    "label": "Financial Investment and Management Applications",
    "tier1": "Finance and Insurance",
    "tier2": "Financial Investment and Management Applications",
    "tier3": "",
    "keywords": "financial investment and management applications"
  },
  {
    "id": "1340",
    "label": "Student Financial Aid",
    "tier1": "Finance and Insurance",
    "tier2": "Student Financial Aid",
    "tier3": "",
    "keywords": "student financial aid"
  },
  {
    "id": "1341",
    "label": "Tax Preparation Services",
    "tier1": "Finance and Insurance",
    "tier2": "Tax Preparation Services",
    "tier3": "",
    "keywords": "tax preparation services"
  },
  {
    "id": "1342",
    "label": "Food and Beverage Services",
    "tier1": "Food and Beverage Services",
    "tier2": "",
    "tier3": "",
    "keywords": "food and beverage services"
  },
  {
    "id": "1343",
    "label": "Bakeries",
    "tier1": "Food and Beverage Services",
    "tier2": "Bakeries",
    "tier3": "",
    "keywords": "bakeries"
  },
  {
    "id": "1344",
    "label": "Catering",
    "tier1": "Food and Beverage Services",
    "tier2": "Catering",
    "tier3": "",
    "keywords": "catering"
  },
  {
    "id": "1345",
    "label": "Fast Food",
    "tier1": "Food and Beverage Services",
    "tier2": "Fast Food",
    "tier3": "",
    "keywords": "fast food"
  },
  {
    "id": "1346",
    "label": "Food Delivery Services",
    "tier1": "Food and Beverage Services",
    "tier2": "Food Delivery Services",
    "tier3": "",
    "keywords": "food delivery services"
  },
  {
    "id": "1347",
    "label": "Restaurants",
    "tier1": "Food and Beverage Services",
    "tier2": "Restaurants",
    "tier3": "",
    "keywords": "restaurants"
  },
  {
    "id": "1348",
    "label": "Gambling",
    "tier1": "Gambling",
    "tier2": "",
    "tier3": "",
    "keywords": "gambling"
  },
  {
    "id": "1349",
    "label": "Casinos",
    "tier1": "Gambling",
    "tier2": "Casinos",
    "tier3": "",
    "keywords": "casinos"
  },
  {
    "id": "1350",
    "label": "Lottery",
    "tier1": "Gambling",
    "tier2": "Lottery",
    "tier3": "",
    "keywords": "lottery"
  },
  {
    "id": "1351",
    "label": "Sports Betting",
    "tier1": "Gambling",
    "tier2": "Sports Betting",
    "tier3": "",
    "keywords": "sports betting"
  },
  {
    "id": "1352",
    "label": "Green/Eco",
    "tier1": "Green/Eco",
    "tier2": "",
    "tier3": "",
    "keywords": "green/eco"
  },
  {
    "id": "1353",
    "label": "Green/Eco Products",
    "tier1": "Green/Eco",
    "tier2": "Green/Eco Products",
    "tier3": "",
    "keywords": "green/eco products"
  },
  {
    "id": "1354",
    "label": "Green/Eco Services",
    "tier1": "Green/Eco",
    "tier2": "Green/Eco Services",
    "tier3": "",
    "keywords": "green/eco services"
  },
  {
    "id": "1355",
    "label": "Gifts and Holiday Items",
    "tier1": "Gifts and Holiday Items",
    "tier2": "",
    "tier3": "",
    "keywords": "gifts and holiday items"
  },
  {
    "id": "1356",
    "label": "Flowers",
    "tier1": "Gifts and Holiday Items",
    "tier2": "Flowers",
    "tier3": "",
    "keywords": "flowers"
  },
  {
    "id": "1357",
    "label": "Gift Baskets",
    "tier1": "Gifts and Holiday Items",
    "tier2": "Gift Baskets",
    "tier3": "",
    "keywords": "gift baskets"
  },
  {
    "id": "1358",
    "label": "Gift Cards and Coupons",
    "tier1": "Gifts and Holiday Items",
    "tier2": "Gift Cards and Coupons",
    "tier3": "",
    "keywords": "gift cards and coupons"
  },
  {
    "id": "1359",
    "label": "Gift Certificates",
    "tier1": "Gifts and Holiday Items",
    "tier2": "Gift Certificates",
    "tier3": "",
    "keywords": "gift certificates"
  },
  {
    "id": "1360",
    "label": "Greeting Cards",
    "tier1": "Gifts and Holiday Items",
    "tier2": "Greeting Cards",
    "tier3": "",
    "keywords": "greeting cards"
  },
  {
    "id": "1361",
    "label": "Party Goods",
    "tier1": "Gifts and Holiday Items",
    "tier2": "Party Goods",
    "tier3": "",
    "keywords": "party goods"
  },
  {
    "id": "1362",
    "label": "Health and Medical Services",
    "tier1": "Health and Medical Services",
    "tier2": "",
    "tier3": "",
    "keywords": "health and medical services"
  },
  {
    "id": "1363",
    "label": "Alternative and Natural Medicine",
    "tier1": "Health and Medical Services",
    "tier2": "Alternative and Natural Medicine",
    "tier3": "",
    "keywords": "alternative and natural medicine"
  },
  {
    "id": "1364",
    "label": "Assisted Living",
    "tier1": "Health and Medical Services",
    "tier2": "Assisted Living",
    "tier3": "",
    "keywords": "assisted living"
  },
  {
    "id": "1365",
    "label": "Chiropractors",
    "tier1": "Health and Medical Services",
    "tier2": "Chiropractors",
    "tier3": "",
    "keywords": "chiropractors"
  },
  {
    "id": "1366",
    "label": "Clinical Research",
    "tier1": "Health and Medical Services",
    "tier2": "Clinical Research",
    "tier3": "",
    "keywords": "clinical research"
  },
  {
    "id": "1367",
    "label": "Cosmetic Medical Services",
    "tier1": "Health and Medical Services",
    "tier2": "Cosmetic Medical Services",
    "tier3": "",
    "keywords": "cosmetic medical services"
  },
  {
    "id": "1368",
    "label": "Dental Care",
    "tier1": "Health and Medical Services",
    "tier2": "Dental Care",
    "tier3": "",
    "keywords": "dental care"
  },
  {
    "id": "1369",
    "label": "Dermatology",
    "tier1": "Health and Medical Services",
    "tier2": "Dermatology",
    "tier3": "",
    "keywords": "dermatology"
  },
  {
    "id": "1370",
    "label": "Drugstores and Pharmacies",
    "tier1": "Health and Medical Services",
    "tier2": "Drugstores and Pharmacies",
    "tier3": "",
    "keywords": "drugstores and pharmacies"
  },
  {
    "id": "1371",
    "label": "Fertility and Family Planning",
    "tier1": "Health and Medical Services",
    "tier2": "Fertility and Family Planning",
    "tier3": "",
    "keywords": "fertility and family planning"
  },
  {
    "id": "1372",
    "label": "General Practitioners",
    "tier1": "Health and Medical Services",
    "tier2": "General Practitioners",
    "tier3": "",
    "keywords": "general practitioners"
  },
  {
    "id": "1373",
    "label": "Home Healthcare",
    "tier1": "Health and Medical Services",
    "tier2": "Home Healthcare",
    "tier3": "",
    "keywords": "home healthcare"
  },
  {
    "id": "1374",
    "label": "Hospitals",
    "tier1": "Health and Medical Services",
    "tier2": "Hospitals",
    "tier3": "",
    "keywords": "hospitals"
  },
  {
    "id": "1375",
    "label": "Mental Health",
    "tier1": "Health and Medical Services",
    "tier2": "Mental Health",
    "tier3": "",
    "keywords": "mental health"
  },
  {
    "id": "1376",
    "label": "Physical Therapists",
    "tier1": "Health and Medical Services",
    "tier2": "Physical Therapists",
    "tier3": "",
    "keywords": "physical therapists"
  },
  {
    "id": "1377",
    "label": "Service Provider Search and Scheduling",
    "tier1": "Health and Medical Services",
    "tier2": "Service Provider Search and Scheduling",
    "tier3": "",
    "keywords": "service provider search and scheduling"
  },
  {
    "id": "1378",
    "label": "Symptom Monitoring Apps",
    "tier1": "Health and Medical Services",
    "tier2": "Symptom Monitoring Apps",
    "tier3": "",
    "keywords": "symptom monitoring apps"
  },
  {
    "id": "1379",
    "label": "Vision Care",
    "tier1": "Health and Medical Services",
    "tier2": "Vision Care",
    "tier3": "",
    "keywords": "vision care, glasses, optics, eyewear"
  },
  {
    "id": "1380",
    "label": "Home and Garden Services",
    "tier1": "Home and Garden Services",
    "tier2": "",
    "tier3": "",
    "keywords": "home and garden services"
  },
  {
    "id": "1381",
    "label": "Appliance Repair",
    "tier1": "Home and Garden Services",
    "tier2": "Appliance Repair",
    "tier3": "",
    "keywords": "appliance repair"
  },
  {
    "id": "1382",
    "label": "Business and Home Security Services",
    "tier1": "Home and Garden Services",
    "tier2": "Business and Home Security Services",
    "tier3": "",
    "keywords": "business and home security services"
  },
  {
    "id": "1383",
    "label": "Carpeting and Flooring Services",
    "tier1": "Home and Garden Services",
    "tier2": "Carpeting and Flooring Services",
    "tier3": "",
    "keywords": "carpeting and flooring services"
  },
  {
    "id": "1384",
    "label": "Do It Yourself Applications",
    "tier1": "Home and Garden Services",
    "tier2": "Do It Yourself Applications",
    "tier3": "",
    "keywords": "do it yourself applications"
  },
  {
    "id": "1385",
    "label": "Emergency Preparedness",
    "tier1": "Home and Garden Services",
    "tier2": "Emergency Preparedness",
    "tier3": "",
    "keywords": "emergency preparedness"
  },
  {
    "id": "1386",
    "label": "Flood, Fire and Gas Safety",
    "tier1": "Home and Garden Services",
    "tier2": "Flood, Fire and Gas Safety",
    "tier3": "",
    "keywords": "flood, fire and gas safety"
  },
  {
    "id": "1387",
    "label": "Gas and Electric Services",
    "tier1": "Home and Garden Services",
    "tier2": "Gas and Electric Services",
    "tier3": "",
    "keywords": "gas and electric services"
  },
  {
    "id": "1388",
    "label": "Home Improvement and Repair",
    "tier1": "Home and Garden Services",
    "tier2": "Home Improvement and Repair",
    "tier3": "",
    "keywords": "home improvement and repair"
  },
  {
    "id": "1389",
    "label": "Home Security and Monitoring Applications",
    "tier1": "Home and Garden Services",
    "tier2": "Home Security and Monitoring Applications",
    "tier3": "",
    "keywords": "home security and monitoring applications"
  },
  {
    "id": "1390",
    "label": "Home Service Provider Review",
    "tier1": "Home and Garden Services",
    "tier2": "Home Service Provider Review",
    "tier3": "",
    "keywords": "home service provider review"
  },
  {
    "id": "1391",
    "label": "Housekeeping Services",
    "tier1": "Home and Garden Services",
    "tier2": "Housekeeping Services",
    "tier3": "",
    "keywords": "housekeeping services"
  },
  {
    "id": "1392",
    "label": "Landscaping Services",
    "tier1": "Home and Garden Services",
    "tier2": "Landscaping Services",
    "tier3": "",
    "keywords": "landscaping services"
  },
  {
    "id": "1393",
    "label": "Lawn and Garden Services",
    "tier1": "Home and Garden Services",
    "tier2": "Lawn and Garden Services",
    "tier3": "",
    "keywords": "lawn and garden services"
  },
  {
    "id": "1394",
    "label": "Pest Exterminators",
    "tier1": "Home and Garden Services",
    "tier2": "Pest Exterminators",
    "tier3": "",
    "keywords": "pest exterminators"
  },
  {
    "id": "1395",
    "label": "Plumbers",
    "tier1": "Home and Garden Services",
    "tier2": "Plumbers",
    "tier3": "",
    "keywords": "plumbers"
  },
  {
    "id": "1396",
    "label": "Pool and Spa Installation and Maintenance",
    "tier1": "Home and Garden Services",
    "tier2": "Pool and Spa Installation and Maintenance",
    "tier3": "",
    "keywords": "pool and spa installation and maintenance"
  },
  {
    "id": "1397",
    "label": "Remodeling and Construction",
    "tier1": "Home and Garden Services",
    "tier2": "Remodeling and Construction",
    "tier3": "",
    "keywords": "remodeling and construction"
  },
  {
    "id": "1398",
    "label": "Water Services",
    "tier1": "Home and Garden Services",
    "tier2": "Water Services",
    "tier3": "",
    "keywords": "water services"
  },
  {
    "id": "1399",
    "label": "Window Installation and Treatments",
    "tier1": "Home and Garden Services",
    "tier2": "Window Installation and Treatments",
    "tier3": "",
    "keywords": "window installation and treatments"
  },
  {
    "id": "1400",
    "label": "Legal Services",
    "tier1": "Legal Services",
    "tier2": "",
    "tier3": "",
    "keywords": "legal services"
  },
  {
    "id": "1401",
    "label": "Lawyers",
    "tier1": "Legal Services",
    "tier2": "Lawyers",
    "tier3": "",
    "keywords": "lawyers"
  },
  {
    "id": "1402",
    "label": "Bail Bonds",
    "tier1": "Legal Services",
    "tier2": "Bail Bonds",
    "tier3": "",
    "keywords": "bail bonds"
  },
  {
    "id": "1403",
    "label": "Media",
    "tier1": "Media",
    "tier2": "",
    "tier3": "",
    "keywords": "media"
  },
  {
    "id": "1404",
    "label": "Blogs/Forums/Social Networks",
    "tier1": "Media",
    "tier2": "Blogs/Forums/Social Networks",
    "tier3": "",
    "keywords": "blogs/forums/social networks"
  },
  {
    "id": "1405",
    "label": "Book Reading and Review Applications",
    "tier1": "Media",
    "tier2": "Book Reading and Review Applications",
    "tier3": "",
    "keywords": "book reading and review applications"
  },
  {
    "id": "1406",
    "label": "Books and Audio Books",
    "tier1": "Media",
    "tier2": "Books and Audio Books",
    "tier3": "",
    "keywords": "books and audio books"
  },
  {
    "id": "1407",
    "label": "Casual Games",
    "tier1": "Media",
    "tier2": "Casual Games",
    "tier3": "",
    "keywords": "casual games"
  },
  {
    "id": "1408",
    "label": "Casual Games Apps",
    "tier1": "Media",
    "tier2": "Casual Games",
    "tier3": "Casual Games Apps",
    "keywords": "casual games apps, dating app"
  },
  {
    "id": "1410",
    "label": "Core Gaming Apps",
    "tier1": "Media",
    "tier2": "Core Gaming",
    "tier3": "Core Gaming Apps",
    "keywords": "core gaming apps"
  },
  {
    "id": "1409",
    "label": "Core Gaming",
    "tier1": "Media",
    "tier2": "Core Gaming",
    "tier3": "",
    "keywords": "core gaming"
  },
  {
    "id": "1411",
    "label": "CDs and Vinyl Records",
    "tier1": "Media",
    "tier2": "CDs and Vinyl Records",
    "tier3": "",
    "keywords": "cds and vinyl records"
  },
  {
    "id": "1412",
    "label": "DVDs",
    "tier1": "Media",
    "tier2": "DVDs",
    "tier3": "",
    "keywords": "dvds"
  },
  {
    "id": "1413",
    "label": "Live Television",
    "tier1": "Media",
    "tier2": "Live Television",
    "tier3": "",
    "keywords": "live television"
  },
  {
    "id": "1414",
    "label": "Magazines and Newspapers",
    "tier1": "Media",
    "tier2": "Magazines and Newspapers",
    "tier3": "",
    "keywords": "magazines and newspapers"
  },
  {
    "id": "1415",
    "label": "Music and Video Streaming Services",
    "tier1": "Media",
    "tier2": "Music and Video Streaming Services",
    "tier3": "",
    "keywords": "music and video streaming services"
  },
  {
    "id": "1416",
    "label": "News and Analysis",
    "tier1": "Media",
    "tier2": "News and Analysis",
    "tier3": "",
    "keywords": "news and analysis"
  },
  {
    "id": "1417",
    "label": "Radio and Podcasts",
    "tier1": "Media",
    "tier2": "Radio and Podcasts",
    "tier3": "",
    "keywords": "radio and podcasts"
  },
  {
    "id": "1418",
    "label": "Sports",
    "tier1": "Media",
    "tier2": "Sports",
    "tier3": "",
    "keywords": "sports"
  },
  {
    "id": "1419",
    "label": "Fantasy Sports",
    "tier1": "Media",
    "tier2": "Sports",
    "tier3": "Fantasy Sports",
    "keywords": "fantasy sports"
  },
  {
    "id": "1420",
    "label": "Sports Highlights",
    "tier1": "Media",
    "tier2": "Sports",
    "tier3": "Sports Highlights",
    "keywords": "sports highlights"
  },
  {
    "id": "1421",
    "label": "Team  News and Analysis",
    "tier1": "Media",
    "tier2": "Sports",
    "tier3": "Team News and Analysis",
    "keywords": "team  news and analysis"
  },
  {
    "id": "1422",
    "label": "Utilities Apps",
    "tier1": "Media",
    "tier2": "Utilities Apps",
    "tier3": "",
    "keywords": "utilities apps"
  },
  {
    "id": "1423",
    "label": "Productivity Apps",
    "tier1": "Media",
    "tier2": "Utilities Apps",
    "tier3": "Productivity Apps",
    "keywords": "productivity apps"
  },
  {
    "id": "1424",
    "label": "Reference Apps",
    "tier1": "Media",
    "tier2": "Utilities Apps",
    "tier3": "Reference Apps",
    "keywords": "reference apps"
  },
  {
    "id": "1425",
    "label": "Search Engine Apps",
    "tier1": "Media",
    "tier2": "Utilities Apps",
    "tier3": "Search Engine Apps",
    "keywords": "search engine apps"
  },
  {
    "id": "1426",
    "label": "Weather Apps",
    "tier1": "Media",
    "tier2": "Utilities Apps",
    "tier3": "Weather Apps",
    "keywords": "weather apps"
  },
  {
    "id": "1427",
    "label": "Metals",
    "tier1": "Metals",
    "tier2": "",
    "tier3": "",
    "keywords": "metals"
  },
  {
    "id": "1428",
    "label": "Coin Trade In",
    "tier1": "Metals",
    "tier2": "Coin Trade In",
    "tier3": "",
    "keywords": "coin trade in"
  },
  {
    "id": "1429",
    "label": "Gold Trade In",
    "tier1": "Metals",
    "tier2": "Gold Trade In",
    "tier3": "",
    "keywords": "gold trade in"
  },
  {
    "id": "1430",
    "label": "Platinum Trade In",
    "tier1": "Metals",
    "tier2": "Platinum Trade In",
    "tier3": "",
    "keywords": "platinum trade in"
  },
  {
    "id": "1431",
    "label": "Silver Trade In",
    "tier1": "Metals",
    "tier2": "Silver Trade In",
    "tier3": "",
    "keywords": "silver trade in"
  },
  {
    "id": "1432",
    "label": "Non-Fiat Currency",
    "tier1": "Non-Fiat Currency",
    "tier2": "",
    "tier3": "",
    "keywords": "non-fiat currency"
  },
  {
    "id": "1433",
    "label": "Cryptocurrency Exchanges",
    "tier1": "Non-Fiat Currency",
    "tier2": "Cryptocurrency Exchanges",
    "tier3": "",
    "keywords": "cryptocurrency exchanges"
  },
  {
    "id": "1434",
    "label": "Cryptocurrency Stock",
    "tier1": "Non-Fiat Currency",
    "tier2": "Cryptocurrency Stock",
    "tier3": "",
    "keywords": "cryptocurrency stock"
  },
  {
    "id": "1435",
    "label": "NFTs",
    "tier1": "Non-Fiat Currency",
    "tier2": "NFTs",
    "tier3": "",
    "keywords": "nfts"
  },
  {
    "id": "1436",
    "label": "Non-Profits",
    "tier1": "Non-Profits",
    "tier2": "",
    "tier3": "",
    "keywords": "non-profits"
  },
  {
    "id": "1437",
    "label": "Charities and Donations",
    "tier1": "Non-Profits",
    "tier2": "Charities and Donations",
    "tier3": "",
    "keywords": "charities and donations"
  },
  {
    "id": "1438",
    "label": "Civic Organizations",
    "tier1": "Non-Profits",
    "tier2": "Civic Organizations",
    "tier3": "",
    "keywords": "civic organizations"
  },
  {
    "id": "1439",
    "label": "Federations and Professional Associations",
    "tier1": "Non-Profits",
    "tier2": "Federations and Professional Associations",
    "tier3": "",
    "keywords": "federations and professional associations"
  },
  {
    "id": "1440",
    "label": "Military Organizations",
    "tier1": "Non-Profits",
    "tier2": "Military Organizations",
    "tier3": "",
    "keywords": "military organizations"
  },
  {
    "id": "1441",
    "label": "Non-Governmental Organizations",
    "tier1": "Non-Profits",
    "tier2": "Non-Governmental Organizations",
    "tier3": "",
    "keywords": "non-governmental organizations"
  },
  {
    "id": "1442",
    "label": "Public Service Announcements",
    "tier1": "Non-Profits",
    "tier2": "Public Service Announcements",
    "tier3": "",
    "keywords": "public service announcements"
  },
  {
    "id": "1443",
    "label": "Scholarships",
    "tier1": "Non-Profits",
    "tier2": "Scholarships",
    "tier3": "",
    "keywords": "scholarships"
  },
  {
    "id": "1444",
    "label": "Pet Ownership",
    "tier1": "Pet Ownership",
    "tier2": "",
    "tier3": "",
    "keywords": "pet ownership"
  },
  {
    "id": "1445",
    "label": "Pet Adoption",
    "tier1": "Pet Ownership",
    "tier2": "Pet Adoption",
    "tier3": "",
    "keywords": "pet adoption"
  },
  {
    "id": "1446",
    "label": "Pet Breeders",
    "tier1": "Pet Ownership",
    "tier2": "Pet Breeders",
    "tier3": "",
    "keywords": "pet breeders"
  },
  {
    "id": "1447",
    "label": "Pet Care and Supply Applications",
    "tier1": "Pet Ownership",
    "tier2": "Pet Care and Supply Applications",
    "tier3": "",
    "keywords": "pet care and supply applications"
  },
  {
    "id": "1448",
    "label": "Pet Grooming",
    "tier1": "Pet Ownership",
    "tier2": "Pet Grooming",
    "tier3": "",
    "keywords": "pet grooming"
  },
  {
    "id": "1449",
    "label": "Pet Sitting",
    "tier1": "Pet Ownership",
    "tier2": "Pet Sitting",
    "tier3": "",
    "keywords": "pet sitting"
  },
  {
    "id": "1450",
    "label": "Veterinary Services",
    "tier1": "Pet Ownership",
    "tier2": "Veterinary Services",
    "tier3": "",
    "keywords": "veterinary services"
  },
  {
    "id": "1451",
    "label": "Personal/Consumer Telecom",
    "tier1": "Personal/Consumer Telecom",
    "tier2": "",
    "tier3": "",
    "keywords": "personal/consumer telcom"
  },
  {
    "id": "1452",
    "label": "Home Internet Services",
    "tier1": "Personal/Consumer Telecom",
    "tier2": "Home Internet Services",
    "tier3": "",
    "keywords": "home internet services"
  },
  {
    "id": "1453",
    "label": "Home Phone Services",
    "tier1": "Personal/Consumer Telecom",
    "tier2": "Home Phone Services",
    "tier3": "",
    "keywords": "home phone services"
  },
  {
    "id": "1454",
    "label": "Home Television Services",
    "tier1": "Personal/Consumer Telecom",
    "tier2": "Home Television Services",
    "tier3": "",
    "keywords": "home television services"
  },
  {
    "id": "1455",
    "label": "Mobile Phone Plans",
    "tier1": "Personal/Consumer Telecom",
    "tier2": "Mobile Phone Plans",
    "tier3": "",
    "keywords": "mobile phone plans"
  },
  {
    "id": "1456",
    "label": "Prepaid International Phone Services",
    "tier1": "Personal/Consumer Telecom",
    "tier2": "Prepaid International Phone Services",
    "tier3": "",
    "keywords": "prepaid international phone services"
  },
  {
    "id": "1457",
    "label": "Pharmaceuticals",
    "tier1": "Pharmaceuticals",
    "tier2": "",
    "tier3": "",
    "keywords": "pharmaceuticals; medications; pils; prescription"
  },
  {
    "id": "1458",
    "label": "Politics",
    "tier1": "Politics",
    "tier2": "",
    "tier3": "",
    "keywords": "politics"
  },
  {
    "id": "1459",
    "label": "Ballot measures",
    "tier1": "Politics",
    "tier2": "Ballot measures",
    "tier3": "",
    "keywords": "ballot measures"
  },
  {
    "id": "1460",
    "label": "Elections",
    "tier1": "Politics",
    "tier2": "Elections",
    "tier3": "",
    "keywords": "elections"
  },
  {
    "id": "1461",
    "label": "Political Action Committees",
    "tier1": "Politics",
    "tier2": "Political Action Committees",
    "tier3": "",
    "keywords": "political action committees"
  },
  {
    "id": "1462",
    "label": "Political Analysis and Opinion",
    "tier1": "Politics",
    "tier2": "Political Analysis and Opinion",
    "tier3": "",
    "keywords": "political analysis and opinion"
  },
  {
    "id": "1463",
    "label": "Political candidates",
    "tier1": "Politics",
    "tier2": "Political candidates",
    "tier3": "",
    "keywords": "political candidates"
  },
  {
    "id": "1464",
    "label": "Political Donations",
    "tier1": "Politics",
    "tier2": "Political Donations",
    "tier3": "",
    "keywords": "political donations"
  },
  {
    "id": "1465",
    "label": "Referendums or promoting causes;",
    "tier1": "Politics",
    "tier2": "Referendums or promoting causes;",
    "tier3": "",
    "keywords": "referendums or promoting causes;"
  },
  {
    "id": "1466",
    "label": "Real Estate",
    "tier1": "Real Estate",
    "tier2": "",
    "tier3": "",
    "keywords": "real estate"
  },
  {
    "id": "1467",
    "label": "Commercial Real Estate",
    "tier1": "Real Estate",
    "tier2": "Commercial Real Estate",
    "tier3": "",
    "keywords": "commercial real estate"
  },
  {
    "id": "1468",
    "label": "Real Estate Rentals",
    "tier1": "Real Estate",
    "tier2": "Real Estate Rentals",
    "tier3": "",
    "keywords": "real estate rentals"
  },
  {
    "id": "1469",
    "label": "Real Estate Sales",
    "tier1": "Real Estate",
    "tier2": "Real Estate Sales",
    "tier3": "",
    "keywords": "real estate sales"
  },
  {
    "id": "1470",
    "label": "Real Estate Services For Owners",
    "tier1": "Real Estate",
    "tier2": "Real Estate Services For Owners",
    "tier3": "",
    "keywords": "real estate services for owners"
  },
  {
    "id": "1471",
    "label": "Religion & Spirituality",
    "tier1": "Religion & Spirituality",
    "tier2": "",
    "tier3": "",
    "keywords": "religion & spirituality"
  },
  {
    "id": "1472",
    "label": "Prayer and Mindfullness Applications",
    "tier1": "Religion & Spirituality",
    "tier2": "Prayer and Mindfullness Applications",
    "tier3": "",
    "keywords": "prayer and mindfullness applications"
  },
  {
    "id": "1473",
    "label": "Prayer and worship services",
    "tier1": "Religion & Spirituality",
    "tier2": "Prayer and Worship Services",
    "tier3": "",
    "keywords": "prayer and worship services"
  },
  {
    "id": "1474",
    "label": "Religious causes",
    "tier1": "Religion & Spirituality",
    "tier2": "Religious Causes",
    "tier3": "",
    "keywords": "religious causes"
  },
  {
    "id": "1475",
    "label": "Religious charities",
    "tier1": "Religion & Spirituality",
    "tier2": "Religious Charities",
    "tier3": "",
    "keywords": "religious charities"
  },
  {
    "id": "1476",
    "label": "Religious organizaitions",
    "tier1": "Religion & Spirituality",
    "tier2": "Religious Organizaitions",
    "tier3": "",
    "keywords": "religious organizaitions"
  },
  {
    "id": "1477",
    "label": "Retail",
    "tier1": "Retail",
    "tier2": "",
    "tier3": "",
    "keywords": "retail"
  },
  {
    "id": "1478",
    "label": "Arts and Crafts Supplies",
    "tier1": "Retail",
    "tier2": "Arts and Crafts Supplies",
    "tier3": "",
    "keywords": "arts and crafts supplies"
  },
  {
    "id": "1479",
    "label": "Cell Phone Stores",
    "tier1": "Retail",
    "tier2": "Cell Phone Stores",
    "tier3": "",
    "keywords": "cell phone stores"
  },
  {
    "id": "1480",
    "label": "Clothing Stores",
    "tier1": "Retail",
    "tier2": "Clothing Stores",
    "tier3": "",
    "keywords": "clothing stores"
  },
  {
    "id": "1481",
    "label": "Department Stores",
    "tier1": "Retail",
    "tier2": "Department Stores",
    "tier3": "",
    "keywords": "department stores"
  },
  {
    "id": "1482",
    "label": "eCommerce",
    "tier1": "Retail",
    "tier2": "eCommerce",
    "tier3": "",
    "keywords": "ecommerce"
  },
  {
    "id": "1483",
    "label": "Factory Outlet Stores",
    "tier1": "Retail",
    "tier2": "Factory Outlet Stores",
    "tier3": "",
    "keywords": "factory outlet stores"
  },
  {
    "id": "1484",
    "label": "Grocery Stores and Supermarkets",
    "tier1": "Retail",
    "tier2": "Grocery Stores and Supermarkets",
    "tier3": "",
    "keywords": "grocery stores and supermarkets"
  },
  {
    "id": "1485",
    "label": "Hardware Stores",
    "tier1": "Retail",
    "tier2": "Hardware Stores",
    "tier3": "",
    "keywords": "hardware stores"
  },
  {
    "id": "1486",
    "label": "Musical Instruments and Record Stores",
    "tier1": "Retail",
    "tier2": "Musical Instruments and Record Stores",
    "tier3": "",
    "keywords": "musical instruments and record stores"
  },
  {
    "id": "1487",
    "label": "Pawn Shops",
    "tier1": "Retail",
    "tier2": "Pawn Shops",
    "tier3": "",
    "keywords": "pawn shops"
  },
  {
    "id": "1488",
    "label": "Pet and Pet Supply Stores",
    "tier1": "Retail",
    "tier2": "Pet and Pet Supply Stores",
    "tier3": "",
    "keywords": "pet and pet supply stores"
  },
  {
    "id": "1489",
    "label": "Shopping Malls",
    "tier1": "Retail",
    "tier2": "Shopping Malls",
    "tier3": "",
    "keywords": "shopping malls"
  },
  {
    "id": "1490",
    "label": "Specialty Stores",
    "tier1": "Retail",
    "tier2": "Specialty Stores",
    "tier3": "",
    "keywords": "specialty stores"
  },
  {
    "id": "1491",
    "label": "Sporting Goods Stores",
    "tier1": "Retail",
    "tier2": "Sporting Goods Stores",
    "tier3": "",
    "keywords": "sporting goods stores"
  },
  {
    "id": "1492",
    "label": "Ticket Services",
    "tier1": "Retail",
    "tier2": "Ticket Services",
    "tier3": "",
    "keywords": "ticket services"
  },
  {
    "id": "1493",
    "label": "Fitness Activities",
    "tier1": "Fitness Activities",
    "tier2": "",
    "tier3": "",
    "keywords": "fitness activities"
  },
  {
    "id": "1494",
    "label": "Dance Studios",
    "tier1": "Fitness Activities",
    "tier2": "Dance Studios",
    "tier3": "",
    "keywords": "dance studios"
  },
  {
    "id": "1495",
    "label": "Gyms and Health Clubs",
    "tier1": "Fitness Activities",
    "tier2": "Gyms and Health Clubs",
    "tier3": "",
    "keywords": "gyms and health clubs"
  },
  {
    "id": "1496",
    "label": "Participant Sports Leagues",
    "tier1": "Fitness Activities",
    "tier2": "Participant Sports Leagues",
    "tier3": "",
    "keywords": "participant sports leagues"
  },
  {
    "id": "1497",
    "label": "Personal Trainers",
    "tier1": "Fitness Activities",
    "tier2": "Personal Trainers",
    "tier3": "",
    "keywords": "personal trainers"
  },
  {
    "id": "1498",
    "label": "Self Defense and Martial Arts Classes",
    "tier1": "Fitness Activities",
    "tier2": "Self Defense and Martial Arts Classes",
    "tier3": "",
    "keywords": "self defense and martial arts classes"
  },
  {
    "id": "1499",
    "label": "Swimming Facilities",
    "tier1": "Fitness Activities",
    "tier2": "Swimming Facilities",
    "tier3": "",
    "keywords": "swimming facilities"
  },
  {
    "id": "1500",
    "label": "Workout and Step Tracking Applications",
    "tier1": "Fitness Activities",
    "tier2": "Workout and Step Tracking Applications",
    "tier3": "",
    "keywords": "workout and step tracking applications"
  },
  {
    "id": "1501",
    "label": "Yoga Studios",
    "tier1": "Fitness Activities",
    "tier2": "Yoga Studios",
    "tier3": "",
    "keywords": "yoga studios"
  },
  {
    "id": "1502",
    "label": "Sexual Health",
    "tier1": "Sexual Health",
    "tier2": "",
    "tier3": "",
    "keywords": "sexual health"
  },
  {
    "id": "1503",
    "label": "Contraceptives",
    "tier1": "Sexual Health",
    "tier2": "Contraceptives",
    "tier3": "",
    "keywords": "contraceptives"
  },
  {
    "id": "1504",
    "label": "Doctor Perscribed Medicines",
    "tier1": "Sexual Health",
    "tier2": "Doctor Perscribed Medicines",
    "tier3": "",
    "keywords": "doctor perscribed medicines"
  },
  {
    "id": "1505",
    "label": "Fertility Tracking Applications",
    "tier1": "Sexual Health",
    "tier2": "Fertility Tracking Applications",
    "tier3": "",
    "keywords": "fertility tracking applications"
  },
  {
    "id": "1506",
    "label": "Non-perscribed Performance Enhancers",
    "tier1": "Sexual Health",
    "tier2": "Non-Perscribed Performance Enhancers",
    "tier3": "",
    "keywords": "non-perscribed performance enhancers"
  },
  {
    "id": "1507",
    "label": "Sporting Goods",
    "tier1": "Sporting Goods",
    "tier2": "",
    "tier3": "",
    "keywords": "sporting goods"
  },
  {
    "id": "1508",
    "label": "Athletics Equipment",
    "tier1": "Sporting Goods",
    "tier2": "Athletics Equipment",
    "tier3": "",
    "keywords": "athletics equipment"
  },
  {
    "id": "1509",
    "label": "Exercise and Fitness Equipment",
    "tier1": "Sporting Goods",
    "tier2": "Exercise and Fitness Equipment",
    "tier3": "",
    "keywords": "exercise and fitness equipment"
  },
  {
    "id": "1510",
    "label": "Indoor Games Equipment",
    "tier1": "Sporting Goods",
    "tier2": "Indoor Games Equipment",
    "tier3": "",
    "keywords": "indoor games equipment"
  },
  {
    "id": "1511",
    "label": "Outdoor Recreation Equipment",
    "tier1": "Sporting Goods",
    "tier2": "Outdoor Recreation Equipment",
    "tier3": "",
    "keywords": "outdoor recreation equipment"
  },
  {
    "id": "1512",
    "label": "Travel and Tourism",
    "tier1": "Travel and Tourism",
    "tier2": "",
    "tier3": "",
    "keywords": "travel and tourism"
  },
  {
    "id": "1513",
    "label": "Accomodations",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "",
    "keywords": "accomodations"
  },
  {
    "id": "1514",
    "label": "Bed and Breakfasts",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "Bed and Breakfasts",
    "keywords": "bed and breakfasts"
  },
  {
    "id": "1515",
    "label": "Camping and Camp Grounds",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "Camping and Camp Grounds",
    "keywords": "camping and camp grounds"
  },
  {
    "id": "1516",
    "label": "Hotels and Resorts",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "Hotels and Resorts",
    "keywords": "hotels and resorts"
  },
  {
    "id": "1517",
    "label": "Motels",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "Motels",
    "keywords": "motels"
  },
  {
    "id": "1518",
    "label": "Timeshares",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "Timeshares",
    "keywords": "timeshares"
  },
  {
    "id": "1519",
    "label": "Vacation Rentals",
    "tier1": "Travel and Tourism",
    "tier2": "Accomodations",
    "tier3": "Vacation Rentals",
    "keywords": "vacation rentals"
  },
  {
    "id": "1520",
    "label": "Air Travel",
    "tier1": "Travel and Tourism",
    "tier2": "Air Travel",
    "tier3": "",
    "keywords": "air travel"
  },
  {
    "id": "1521",
    "label": "Cruises",
    "tier1": "Travel and Tourism",
    "tier2": "Cruises",
    "tier3": "",
    "keywords": "cruises"
  },
  {
    "id": "1522",
    "label": "Rail Travel",
    "tier1": "Travel and Tourism",
    "tier2": "Rail Travel",
    "tier3": "",
    "keywords": "rail travel"
  },
  {
    "id": "1523",
    "label": "Sightseeing Tours and Activities",
    "tier1": "Travel and Tourism",
    "tier2": "Sightseeing Tours and Activities",
    "tier3": "",
    "keywords": "sightseeing tours and activities"
  },
  {
    "id": "1524",
    "label": "Travel Agents and Online Travel Services",
    "tier1": "Travel and Tourism",
    "tier2": "Travel Agents and Online Travel Services",
    "tier3": "",
    "keywords": "travel agents and online travel services"
  },
  {
    "id": "1525",
    "label": "Travel Packages",
    "tier1": "Travel and Tourism",
    "tier2": "Travel Packages",
    "tier3": "",
    "keywords": "travel packages"
  },
  {
    "id": "1526",
    "label": "Travel Planning and Itinerary Management Applications",
    "tier1": "Travel and Tourism",
    "tier2": "Travel Planning and Itinerary Management Applications",
    "tier3": "",
    "keywords": "travel planning and itinerary management applications"
  },
  {
    "id": "1527",
    "label": "Tobacco",
    "tier1": "Tobacco",
    "tier2": "",
    "tier3": "",
    "keywords": "tobacco"
  },
  {
    "id": "1528",
    "label": "Cigars",
    "tier1": "Tobacco",
    "tier2": "Cigars",
    "tier3": "",
    "keywords": "cigars"
  },
  {
    "id": "1529",
    "label": "Smokeless Tobacco",
    "tier1": "Tobacco",
    "tier2": "Smokeless Tobacco",
    "tier3": "",
    "keywords": "smokeless tobacco"
  },
  {
    "id": "1530",
    "label": "Vaping",
    "tier1": "Tobacco",
    "tier2": "Vaping",
    "tier3": "",
    "keywords": "vaping"
  },
  {
    "id": "1531",
    "label": "Vaping Cartridges",
    "tier1": "Tobacco",
    "tier2": "Vaping Cartridges",
    "tier3": "",
    "keywords": "vaping cartridges"
  },
  {
    "id": "1532",
    "label": "Vaporizors",
    "tier1": "Tobacco",
    "tier2": "Vaporizors",
    "tier3": "",
    "keywords": "vaporizors"
  },
  {
    "id": "1533",
    "label": "Vehicles",
    "tier1": "Vehicles",
    "tier2": "",
    "tier3": "",
    "keywords": "vehicles; motorvehicles; cars;"
  },
  {
    "id": "1534",
    "label": "Automotive Leasing",
    "tier1": "Vehicles",
    "tier2": "Automotive Leasing",
    "tier3": "",
    "keywords": "automotive leasing; car leasing; automobile leasing;"
  },
  {
    "id": "1535",
    "label": "Automotive Ownership",
    "tier1": "Vehicles",
    "tier2": "Automotive Ownership",
    "tier3": "",
    "keywords": "automotive ownership; car ownership; vehicle ownership"
  },
  {
    "id": "1536",
    "label": "New vehicle Ownership",
    "tier1": "Vehicles",
    "tier2": "Automotive Ownership",
    "tier3": "New Vehicle Ownership",
    "keywords": "new vehicle ownership; new car ownership;"
  },
  {
    "id": "1537",
    "label": "Pre-owned Automotive Ownership",
    "tier1": "Vehicles",
    "tier2": "Automotive Ownership",
    "tier3": "Pre-owned Automotive Ownership",
    "keywords": "pre-owned automotive ownership; pre-owned car ownership; used car ownership;"
  },
  {
    "id": "1538",
    "label": "Automotive Products",
    "tier1": "Vehicles",
    "tier2": "Automotive Products",
    "tier3": "",
    "keywords": "automotive products; car products"
  },
  {
    "id": "1539",
    "label": "Automotive Care Products",
    "tier1": "Vehicles",
    "tier2": "Automotive Products",
    "tier3": "Automotive Care Products",
    "keywords": "automotive care products; car care; automobile care;"
  },
  {
    "id": "1540",
    "label": "Automotive Parts and Accessories",
    "tier1": "Vehicles",
    "tier2": "Automotive Products",
    "tier3": "Automotive Parts and Accessories",
    "keywords": "automotive parts and accessories; car parts and accessories; automobile parts and accessories;"
  },
  {
    "id": "1541",
    "label": "Aftermarket Parts and Accessories",
    "tier1": "Vehicles",
    "tier2": "Automotive Products",
    "tier3": "Aftermarket Parts and Accessories",
    "keywords": "aftermarket parts and accessories"
  },
  {
    "id": "1542",
    "label": "Automotive Services",
    "tier1": "Vehicles",
    "tier2": "Automotive Services",
    "tier3": "",
    "keywords": "automotive services; car services;"
  },
  {
    "id": "1543",
    "label": "Auto Towing",
    "tier1": "Vehicles",
    "tier2": "Automotive Services",
    "tier3": "Auto Towing",
    "keywords": "auto towing; car towing;"
  },
  {
    "id": "1544",
    "label": "Auto Repair",
    "tier1": "Vehicles",
    "tier2": "Automotive Services",
    "tier3": "Auto Repair",
    "keywords": "auto repair; car repair;"
  },
  {
    "id": "1545",
    "label": "Car Wash",
    "tier1": "Vehicles",
    "tier2": "Automotive Services",
    "tier3": "Car Wash",
    "keywords": "car wash"
  },
  {
    "id": "1546",
    "label": "Automotive Sales Applications",
    "tier1": "Vehicles",
    "tier2": "Automotive Sales Applications",
    "tier3": "",
    "keywords": "automotive sales applications; car sales applications;"
  },
  {
    "id": "1547",
    "label": "Ride-sharing Services",
    "tier1": "Vehicles",
    "tier2": "Ride-sharing Services",
    "tier3": "",
    "keywords": "ride-sharing services"
  },
  {
    "id": "1548",
    "label": "Taxi Services",
    "tier1": "Vehicles",
    "tier2": "Taxi Services",
    "tier3": "",
    "keywords": "taxi services"
  },
  {
    "id": "1549",
    "label": "Vehicle Rental",
    "tier1": "Vehicles",
    "tier2": "Vehicle Rental",
    "tier3": "",
    "keywords": "vehicle rental; car rental; motorhome rental;"
  },
  {
    "id": "1550",
    "label": "Vehicle Type",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "",
    "keywords": "vehicle type"
  },
  {
    "id": "1551",
    "label": "Boats",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Boats",
    "keywords": "boats"
  },
  {
    "id": "1552",
    "label": "Diesel Vehicles",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Diesel Vehicles",
    "keywords": "diesel vehicles; diesel cars"
  },
  {
    "id": "1553",
    "label": "Electric Vehicles",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Electric Vehicles",
    "keywords": "electric vehicles; electric cars"
  },
  {
    "id": "1554",
    "label": "Gas Vehicles",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Gas Vehicles",
    "keywords": "gas vehicles; gas cars"
  },
  {
    "id": "1555",
    "label": "Hybrid Vehicles",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Hybrid Vehicles",
    "keywords": "hybrid vehicles; hybrid cars"
  },
  {
    "id": "1556",
    "label": "Recreational Vehicles",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Recreational Vehicles",
    "keywords": "recreational vehicles"
  },
  {
    "id": "1557",
    "label": "Scooters, Motorbikes, and E-bikes",
    "tier1": "Vehicles",
    "tier2": "Vehicle Type",
    "tier3": "Scooters, Motorbikes, and E-bikes",
    "keywords": "scooters, motorbikes, and e-bikes"
  },
  {
    "id": "1558",
    "label": "Weapons & Ammunition",
    "tier1": "Weapons and Ammunition",
    "tier2": "",
    "tier3": "",
    "keywords": "weapons & ammunition"
  },
  {
    "id": "1559",
    "label": "Ammunition",
    "tier1": "Weapons and Ammunition",
    "tier2": "Ammunition",
    "tier3": "",
    "keywords": "ammunition"
  },
  {
    "id": "1560",
    "label": "Guns",
    "tier1": "Weapons and Ammunition",
    "tier2": "Guns",
    "tier3": "",
    "keywords": "guns"
  },
  {
    "id": "1561",
    "label": "Gun Accessories",
    "tier1": "Weapons and Ammunition",
    "tier2": "Gun Accessories",
    "tier3": "",
    "keywords": "gun accessories"
  },
  {
    "id": "1562",
    "label": "Gun Shows and Auctions",
    "tier1": "Weapons and Ammunition",
    "tier2": "Gun Shows and Auctions",
    "tier3": "",
    "keywords": "gun shows and auctions"
  },
  {
    "id": "1563",
    "label": "Non-Projectile Weapons",
    "tier1": "Weapons and Ammunition",
    "tier2": "Non-Projectile Weapons",
    "tier3": "",
    "keywords": "non-projectile weapons"
  },
  {
    "id": "1564",
    "label": "Taser and Stun Guns",
    "tier1": "Weapons and Ammunition",
    "tier2": "Taser and Stun Guns",
    "tier3": "",
    "keywords": "taser and stun guns"
  }
];

const IAB_BRAND_HINTS: Record<string, string[]> = {
  toyota: ["vehicles", "cars", "automotive ownership", "hybrid vehicles", "electric vehicles"],
  ford: ["vehicles", "cars", "automotive ownership", "gas vehicles", "electric vehicles"],
  jeep: ["vehicles", "cars", "automotive ownership", "vehicle type"],
  bmw: ["vehicles", "cars", "automotive ownership"],
  mercedes: ["vehicles", "cars", "automotive ownership"],
  apple: ["consumer electronics", "mobile phones and accessories", "computers", "tablets"],
  samsung: ["consumer electronics", "mobile phones and accessories", "televisions"],
  playstation: ["video games and consoles", "video game consoles", "core gaming"],
  xbox: ["video games and consoles", "video game consoles", "core gaming"],
  nintendo: ["video games and consoles", "video game consoles", "core gaming"],
  netflix: ["music and video streaming services", "media"],
  youtube: ["music and video streaming services", "media"],
  spotify: ["music and video streaming services", "media"],
  nike: ["sportswear", "footwear", "sporting goods"],
  adidas: ["sportswear", "footwear", "sporting goods"],
  puma: ["sportswear", "footwear", "sporting goods"],
  cocacola: ["beverages", "carbonated soft drinks", "consumer packaged goods"],
  coca: ["beverages", "carbonated soft drinks", "consumer packaged goods"],
  pepsi: ["beverages", "carbonated soft drinks", "consumer packaged goods"],
  mcdonalds: ["fast food", "restaurants", "food and beverage services"],
  burgerking: ["fast food", "restaurants", "food and beverage services"],
  kfc: ["fast food", "restaurants", "food and beverage services"],
  gucci: ["clothing and accessories", "clothing", "handbags and wallets"],
  chanel: ["clothing and accessories", "cosmetics", "fragrance"],
  louisvuitton: ["clothing and accessories", "handbags and wallets", "clothing"],
};

function normalizeMatchText(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactKey(value: string) {
  return normalizeMatchText(value).replace(/\s+/g, "");
}

function tokenizeKeywords(value: string) {
  return (value || "")
    .split(/[;,]/)
    .map((item) => normalizeMatchText(item))
    .filter((item) => item.length >= 3);
}

function getIabPath(row: IabTaxonomyRow) {
  return [row.tier1, row.tier2, row.tier3]
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .join(" → ");
}

function inferIabClassification(fields: string[]) {
  const cleanFields = fields.filter(Boolean);
  const searchableText = normalizeMatchText(cleanFields.join(" "));
  const compactSearchableText = compactKey(cleanFields.join(" "));

  if (!searchableText) {
    return null;
  }

  const brandHints = Object.entries(IAB_BRAND_HINTS)
    .filter(([brandKey]) => compactSearchableText.includes(brandKey))
    .flatMap(([, hints]) => hints);

  const enrichedSearchText = normalizeMatchText(
    [searchableText, ...brandHints].join(" ")
  );

  const scored = IAB_TAXONOMY.map((row) => {
    const candidates = [
      row.label,
      row.tier1,
      row.tier2,
      row.tier3,
      ...tokenizeKeywords(row.keywords),
    ]
      .map((item) => normalizeMatchText(item))
      .filter(Boolean);

    const matchedKeywords = Array.from(
      new Set(
        candidates.filter((candidate) => {
          if (candidate.length < 3) return false;
          return enrichedSearchText.includes(candidate);
        })
      )
    );

    const score = matchedKeywords.reduce((total, keyword) => {
      if (keyword.length > 18) return total + 5;
      if (keyword.length > 10) return total + 3;
      return total + 1;
    }, 0);

    return {
      row,
      score,
      matchedKeywords,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best) {
    return null;
  }

  return {
    id: best.row.id,
    label: best.row.label,
    path: getIabPath(best.row) || best.row.label,
    source: "Inferred from uploaded IAB taxonomy keywords",
    confidence:
      best.score >= 8 ? "High" : best.score >= 4 ? "Medium" : "Low",
    matchedKeywords: best.matchedKeywords.slice(0, 5),
  };
}

function enrichFallbackSignal(signal: any) {
  const importedIabClass =
    signal.iabClass && !String(signal.iabClass).includes("Unclassified")
      ? signal.iabClass
      : null;

  const inferredIab = inferIabClassification([
    signal.title,
    signal.advertiser,
    signal.brand,
    signal.product,
    signal.canonicalProduct,
    signal.description,
    signal.program,
  ]);

  return {
    ...signal,
    iabClass:
      importedIabClass ||
      inferredIab?.path ||
      signal.iabClass ||
      "Unclassified / pending IAB mapping",
    iabId: inferredIab?.id || null,
    iabConfidence: importedIabClass
      ? "Imported"
      : inferredIab?.confidence || "None",
    iabMatchedKeywords: importedIabClass
      ? []
      : inferredIab?.matchedKeywords || [],
    classificationSource: importedIabClass
      ? signal.classificationSource
      : inferredIab
      ? inferredIab.source
      : signal.classificationSource || "No IAB taxonomy match found",
  };
}


function getTitle(item: any) {
  const combined = [item.advertiser, item.brand, item.product]
    .filter(Boolean)
    .join(" - ");

  return item.title || item.name || combined || "Monitoring Signal";
}

function getSpotCode(item: any) {
  return item.spot_code || item.spotCode || item.code || null;
}

function getIabClass(item: any) {
  return (
    item.iab_class ||
    item.iabClass ||
    item.iab_category ||
    item.iabCategory ||
    item.iab_tier_1 ||
    item.iabTier1 ||
    null
  );
}

function dedupe(values: any[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-[11px] font-black text-cyan-100">
        i
      </span>

      <span className="pointer-events-none absolute right-0 top-7 z-50 hidden w-72 rounded-2xl border border-cyan-300/20 bg-slate-950/95 p-4 text-left text-xs leading-5 text-gray-200 shadow-[0_0_35px_rgba(34,211,238,0.16)] backdrop-blur-xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

function MetricCard({
  value,
  label,
  tone,
  tooltip,
  source,
}: {
  value: number;
  label: string;
  tone?: "cyan" | "pink" | "indigo" | "green";
  tooltip: string;
  source: string;
}) {
  const color =
    tone === "pink"
      ? "text-fuchsia-200"
      : tone === "indigo"
      ? "text-indigo-200"
      : tone === "green"
      ? "text-green-200"
      : "text-cyan-200";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`text-4xl font-black ${color}`}>{value}</div>
        <InfoTooltip text={tooltip} />
      </div>

      <div className="text-sm font-semibold text-gray-200">{label}</div>
      <div className="mt-2 text-xs leading-5 text-gray-500">{source}</div>
    </div>
  );
}

function ExplanationCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/24 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-cyan-100">{title}</h3>
        <InfoTooltip text="This explanatory panel is part of the clarity layer. It explains what the numbers and labels mean before any deeper AI inference is applied." />
      </div>

      <div className="space-y-2 text-sm leading-6 text-gray-300">{children}</div>
    </div>
  );
}


function getCanonicalProductName(value: string) {
  const normalized = normalizeMatchText(value);

  if (!normalized) return "Unspecified Product";

  if (
    normalized.includes("zero sugar") ||
    normalized.includes("coke zero") ||
    normalized.includes("coca cola zero")
  ) {
    return "Coca-Cola Zero Sugar";
  }

  if (normalized.includes("coca cola") || normalized === "coke") {
    return "Coca-Cola";
  }

  if (normalized.includes("big mac")) {
    return "Big Mac";
  }

  if (normalized.includes("whopper")) {
    return "Whopper";
  }

  if (normalized.includes("air max")) {
    return "Nike Air Max";
  }

  if (normalized.includes("ultraboost")) {
    return "Adidas Ultraboost";
  }

  return value || "Unspecified Product";
}

function getCampaignObjectName(item: any) {
  return (
    item.campaign ||
    item.campaign_name ||
    item.campaignName ||
    item.title ||
    item.name ||
    "Unassigned Campaign"
  );
}


function isPlaceholderBrand(value: string) {
  const normalized = normalizeMatchText(value);

  return (
    !normalized ||
    normalized.includes("campaign intelligence") ||
    normalized.includes("campaign brand") ||
    normalized.includes("product intelligence") ||
    normalized.includes("audience intelligence") ||
    normalized.includes("detected brand") ||
    normalized.includes("brand intelligence")
  );
}

function getDisplayBrandName(item: any) {
  const directBrand =
    item.brand ||
    item.brand_name ||
    item.brandName ||
    item.advertiser ||
    "";

  if (!isPlaceholderBrand(directBrand)) {
    return directBrand;
  }

  const title = item.title || item.name || "";
  const normalizedTitle = normalizeMatchText(title);

  if (normalizedTitle.includes("toyota")) return "Toyota";
  if (normalizedTitle.includes("ford")) return "Ford";
  if (normalizedTitle.includes("jeep")) return "Jeep";
  if (normalizedTitle.includes("nike")) return "Nike";
  if (normalizedTitle.includes("adidas")) return "Adidas";
  if (normalizedTitle.includes("puma")) return "Puma";
  if (normalizedTitle.includes("coca cola") || normalizedTitle.includes("coke")) return "Coca-Cola";
  if (normalizedTitle.includes("pepsi")) return "Pepsi";
  if (normalizedTitle.includes("mcdonald")) return "McDonald's";
  if (normalizedTitle.includes("burger king")) return "Burger King";
  if (normalizedTitle.includes("kfc")) return "KFC";
  if (normalizedTitle.includes("apple")) return "Apple";
  if (normalizedTitle.includes("samsung")) return "Samsung";
  if (normalizedTitle.includes("playstation")) return "PlayStation";
  if (normalizedTitle.includes("xbox")) return "Xbox";
  if (normalizedTitle.includes("nintendo")) return "Nintendo";
  if (normalizedTitle.includes("netflix")) return "Netflix";
  if (normalizedTitle.includes("youtube")) return "YouTube";
  if (normalizedTitle.includes("spotify")) return "Spotify";

  return "Unassigned Brand";
}

function getDataQualityFlags(signal: any) {
  const flags: string[] = [];

  if (signal.brand === "Unassigned Brand") {
    flags.push("Brand needs review");
  }

  if (!signal.iabClass || String(signal.iabClass).includes("Unclassified")) {
    flags.push("IAB mapping missing");
  }

  if (!signal.product || signal.product === "Advertising Signal") {
    flags.push("Product needs normalization");
  }

  if (!signal.campaignObject || signal.campaignObject === "Unassigned Campaign") {
    flags.push("Campaign needs assignment");
  }

  return flags;
}

function normalizeMonitoringSpot(item: any) {
  const title =
    item.promotion_name ||
    item.title ||
    item.name ||
    item.brand_name ||
    "ARGUS Monitoring Signal";

  const spotCode = item.id || getSpotCode(item);
  const importedIabClass =
    item.iab_full_path ||
    [item.iab_tier_1, item.iab_tier_2, item.iab_tier_3]
      .filter(Boolean)
      .join(" → ") ||
    getIabClass(item);

  const advertiser =
    item.advertiser_name ||
    item.advertiser ||
    item.brand_name ||
    "ARGUS Advertising Intelligence";

  const brand =
    item.brand_name ||
    getDisplayBrandName(item);

  const product =
    item.products_text ||
    item.product ||
    item.product_name ||
    "Advertising Signal";

  const description =
    [
      item.primary_category ? `Primary category: ${item.primary_category}` : null,
      item.subcategory ? `Subcategory: ${item.subcategory}` : null,
      item.promotion_name ? `Promotion: ${item.promotion_name}` : null,
      item.risk_labels?.length
        ? `Observation tags: ${item.risk_labels.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") ||
    item.description ||
    item.objective ||
    "ARGUS classified advertising signal prepared for Brand Galaxy monitoring intelligence.";

  const inferredIab = inferIabClassification([
    title,
    advertiser,
    brand,
    product,
    description,
    item.primary_category,
    item.subcategory,
    item.iab_full_path,
    item.iab_selected_category,
  ]);

  const durationSeconds =
    typeof item.duration_ms === "number"
      ? Math.round(item.duration_ms / 1000)
      : item.duration || item.duration_seconds || 30;

  return {
    id: `argus-${item.id || spotCode || title}`,
    type: item.risk_labels?.length ? "ARGUS RISK SIGNAL" : "ARGUS AD SIGNAL",
    title,
    advertiser,
    brand,
    product,
    canonicalProduct: getCanonicalProductName(product),
    campaignObject:
      item.promotion_name ||
      item.campaign_name ||
      item.campaignObject ||
      title ||
      "ARGUS Campaign Signal",
    network: item.primary_category || item.category || "ARGUS API",
    program:
      item.subcategory ||
      item.iab_selected_category ||
      item.iab_tier_1 ||
      "ARGUS Monitoring Feed",
    duration: durationSeconds,
    spotCode,
    iabClass:
      importedIabClass ||
      inferredIab?.path ||
      "Unclassified / pending IAB mapping",
    iabId: item.iab_unique_id || inferredIab?.id || null,
    iabConfidence:
      item.iab_confidence ||
      (importedIabClass ? "Imported" : inferredIab?.confidence || "None"),
    iabMatchedKeywords: importedIabClass ? [] : inferredIab?.matchedKeywords || [],
    classificationSource: importedIabClass
      ? "IAB classification imported from ARGUS API"
      : inferredIab
      ? inferredIab.source
      : "No ARGUS IAB class found and no taxonomy keyword match was strong enough",
    description,
    transcript:
      item.transcript ||
      item.full_text ||
      "ARGUS signal includes classification metadata. Open the full ARGUS ad endpoint for transcript, OCR, frames and evidence.",
    source: "ARGUS Public API",
    confidence: item.confidence,
    sensitiveCategory: item.sensitive_category,
    riskLabels: item.risk_labels || [],
    ingestedAt: item.ingested_at,
  };
}

export default function MonitoringPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [argusStats, setArgusStats] = useState<ArgusStats | null>(null);
  const [argusError, setArgusError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>("campaign");

  useEffect(() => {
    async function loadMonitoring() {
      setLoading(true);
      setArgusError(null);

      try {
        const [adsResponse, statsResponse] = await Promise.all([
          fetch("/api/argus/ads?limit=50", { cache: "no-store" }),
          fetch("/api/argus/stats?limit=50", { cache: "no-store" }),
        ]);

        if (!adsResponse.ok) {
          throw new Error(`ARGUS ads request failed: ${adsResponse.status}`);
        }

        const adsData = await adsResponse.json();
        const statsData = statsResponse.ok ? await statsResponse.json() : null;

        setSpots(adsData.items || []);
        setArgusStats(statsData);
      } catch (error: any) {
        console.error(error);
        setArgusError(error?.message || "Failed to load ARGUS monitoring data");
        setSpots([]);
        setArgusStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadMonitoring();
  }, []);


  const fallbackSignals = useMemo(() => {
    return [];
  }, []);

  const monitoringFeed = useMemo(() => {
    return spots.map(normalizeMonitoringSpot);
  }, [spots]);


  const featuredSignal = monitoringFeed[0];

  const uniqueAdvertisers = useMemo(() => {
    return new Set(monitoringFeed.map((item) => item.advertiser).filter(Boolean))
      .size;
  }, [monitoringFeed]);

  const uniqueFeedProducts = useMemo(() => {
    return new Set(monitoringFeed.map((item) => item.product).filter(Boolean))
      .size;
  }, [monitoringFeed]);

  const uniqueBrands = useMemo(() => {
    return new Set(monitoringFeed.map((item) => item.brand).filter(Boolean)).size;
  }, [monitoringFeed]);

  const uniqueCampaigns = useMemo(() => {
    return new Set(
      monitoringFeed.map((item) => item.campaignObject).filter(Boolean)
    ).size;
  }, [monitoringFeed]);

  const classifiedSignals = useMemo(() => {
    return monitoringFeed.filter(
      (item) =>
        item.iabClass &&
        !String(item.iabClass).includes("Unclassified") &&
        !String(item.iabClass).includes("pending")
    ).length;
  }, [monitoringFeed]);

  const riskSignalCount = useMemo(() => {
    return monitoringFeed.filter((item) => item.riskLabels?.length > 0).length;
  }, [monitoringFeed]);

  const topBrands = useMemo(() => {
    const counts: Record<string, number> = {};

    monitoringFeed.forEach((item) => {
      if (!item.brand) return;
      counts[item.brand] = (counts[item.brand] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [monitoringFeed]);

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};

    monitoringFeed.forEach((item) => {
      const category = item.network || item.program || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [monitoringFeed]);

  const latestArgusAds = useMemo(() => {
    return [...monitoringFeed]
      .sort((a, b) => {
        const aTime = a.ingestedAt ? new Date(a.ingestedAt).getTime() : 0;
        const bTime = b.ingestedAt ? new Date(b.ingestedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [monitoringFeed]);


  const groupedSignals = useMemo(() => {
    const groups: Record<string, any[]> = {};

    monitoringFeed.forEach((item) => {
      const key =
        groupMode === "campaign"
          ? item.campaignObject || item.title || "Unknown Campaign"
          : groupMode === "product"
          ? item.canonicalProduct || item.product || "Unknown Product"
          : item.brand || "Unknown Brand";

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups)
      .map(([key, signals]) => ({
        key,
        signals,
        count: signals.length,
        brands: dedupe(signals.map((signal) => signal.brand)),
        products: dedupe(
          signals.map((signal) => signal.canonicalProduct || signal.product)
        ),
        rawProducts: dedupe(signals.map((signal) => signal.product)),
        campaigns: dedupe(
          signals.map((signal) => signal.campaignObject || signal.title)
        ),
        advertisers: dedupe(signals.map((signal) => signal.advertiser)),
        iabClasses: dedupe(signals.map((signal) => signal.iabClass)),
        iabConfidence: dedupe(signals.map((signal) => signal.iabConfidence)),
        iabMatchedKeywords: dedupe(
          signals.flatMap((signal) => signal.iabMatchedKeywords || [])
        ),
        dataQualityFlags: dedupe(
          signals.flatMap((signal) => getDataQualityFlags(signal))
        ),
        sources: dedupe(signals.map((signal) => signal.source)),
      }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }, [monitoringFeed, groupMode]);

  const groupModeDescription =
    groupMode === "campaign"
      ? "Grouping by campaign/promotion shows which products, brands, IAB classes and ARGUS ad signals appear inside each campaign object."
      : groupMode === "product"
      ? "Grouping by product shows all ARGUS campaigns and brands where each detected product appears."
      : "Grouping by brand shows all ARGUS products, campaigns, IAB classes and signals connected to each brand.";

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
              Signal Observatory
            </div>

            <h1 className="mb-4 text-5xl font-black tracking-tight sm:text-7xl">
              Monitoring Center
            </h1>

            <p className="max-w-3xl text-lg leading-8 text-gray-300">
              Advertising signals transformed into brand, product, campaign and
              audience intelligence for the Brand Galaxy graph.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              value={argusStats?.total_ads || spots.length}
              label="ARGUS Ads"
              tone="cyan"
              source="Source: ARGUS Public API"
              tooltip="Total classified ads returned by the ARGUS public API stats endpoint. The feed below loads live ARGUS ad records through the secure backend route."
            />

            <MetricCard
              value={uniqueBrands}
              label="Detected Brands"
              tone="pink"
              source="Source: ARGUS brand_name"
              tooltip="Unique brands detected in the currently loaded ARGUS ad feed. This is based on live classified ad records, not the old demo brands table."
            />

            <MetricCard
              value={uniqueFeedProducts}
              label="Detected Products"
              tone="indigo"
              source="Source: ARGUS products_text"
              tooltip="Unique product strings detected from ARGUS products_text. Product normalization groups similar labels into canonical product objects where possible."
            />

            <MetricCard
              value={uniqueCampaigns}
              label="Campaign Signals"
              tone="green"
              source="Source: ARGUS promotion_name"
              tooltip="Unique ARGUS promotion/campaign names detected in the current feed. Multiple ads can belong to the same campaign or promotion."
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <ExplanationCard title="Dataset Context">
              <p>
                The metrics above now come from the live ARGUS public API.
                Ads are classified records, while brands, products, IAB labels
                and campaigns are extracted intelligence fields from those ads.
              </p>
              <p>
                The numbers are not expected to match one-to-one: one ad can
                contain one brand, several products, one promotion, multiple IAB
                content categories and observation/risk labels.
              </p>
            </ExplanationCard>

            <ExplanationCard title="Classification Method">
              <p>
                ARGUS provides IAB product and content taxonomy fields directly.
                Imported ARGUS IAB values are shown first; local taxonomy inference
                is only used as a fallback when an ARGUS field is missing.
              </p>
              <p>
                If an item is still marked as unclassified, it means the ARGUS
                record did not include a usable IAB value and the local fallback
                matcher did not produce a strong enough match.
              </p>
            </ExplanationCard>

            <ExplanationCard title="Current Feed Scope">
              <p>
                The feed loads live classified ads from{" "}
                <span className="text-cyan-100">ARGUS Public API</span> through
                your secure Next.js API route, so the API key stays server-side.
              </p>
              <p>
                Feed-level unique advertisers: {uniqueAdvertisers}. Feed-level
                unique products: {uniqueFeedProducts}. Classified signals:{" "}
                {classifiedSignals}. Risk/observation signals: {riskSignalCount}.
              </p>
            </ExplanationCard>
          </div>

          <div className="mb-8 overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-cyan-500/10 shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-xl">
            <div className="border-b border-white/10 bg-black/25 p-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-green-200">
                <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_14px_rgba(134,239,172,0.8)]" />
                ARGUS LIVE API CONNECTED
              </div>

              <h2 className="text-4xl font-black tracking-tight text-white">
                Live Advertising Intelligence Feed
              </h2>

              <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-300">
                This dashboard is now reading classified ads directly from the
                ARGUS Public API through <span className="text-cyan-100">/api/argus/ads</span>.
                Brand, product, campaign, IAB, confidence and observation fields
                below are coming from the live API response.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
              <div className="border-b border-white/10 p-6 xl:border-b-0 xl:border-r">
                <div className="mb-4 text-xs uppercase tracking-[0.25em] text-cyan-200">
                  Latest ARGUS Ads
                </div>

                <div className="space-y-3">
                  {latestArgusAds.length > 0 ? (
                    latestArgusAds.map((ad) => (
                      <div
                        key={ad.id}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                            {ad.spotCode}
                          </span>
                          <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                            {ad.brand}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-300">
                            {ad.duration}s
                          </span>
                        </div>

                        <div className="font-bold text-white">{ad.title}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {ad.product}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">
                      Waiting for ARGUS ads...
                    </div>
                  )}
                </div>
              </div>

              <div className="border-b border-white/10 p-6 xl:border-b-0 xl:border-r">
                <div className="mb-4 text-xs uppercase tracking-[0.25em] text-fuchsia-200">
                  Top Live Brands
                </div>

                <div className="space-y-3">
                  {(topBrands.length > 0 ? topBrands : argusStats?.by_brand || [])
                    .slice(0, 6)
                    .map((brand) => (
                      <div
                        key={brand.value}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                      >
                        <span className="truncate text-sm font-semibold text-white">
                          {brand.value}
                        </span>
                        <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                          {brand.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 text-xs uppercase tracking-[0.25em] text-amber-200">
                  Top Categories / Risk
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-3xl font-black text-cyan-100">
                      {classifiedSignals}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Classified in feed
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-3xl font-black text-red-100">
                      {riskSignalCount}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Observation signals
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(topCategories.length > 0
                    ? topCategories
                    : argusStats?.by_category || []
                  )
                    .slice(0, 5)
                    .map((category) => (
                      <div
                        key={category.value}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                      >
                        <span className="truncate text-sm font-semibold text-white">
                          {category.value}
                        </span>
                        <span className="rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
                          {category.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {argusError && (
            <div className="mb-6 rounded-[2rem] border border-red-300/20 bg-red-500/10 p-5 text-sm text-red-100">
              ARGUS API error: {argusError}
            </div>
          )}

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 text-gray-300 backdrop-blur-xl">
              Loading live ARGUS monitoring intelligence...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
              <aside className="rounded-[2rem] border border-cyan-300/20 bg-cyan-500/10 p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                    Intelligence Snapshot
                  </div>
                  <InfoTooltip text="This panel highlights the first available signal in the monitoring feed. It is a snapshot, not a total count." />
                </div>

                <h2 className="mb-6 text-3xl font-black">
                  Signal Command View
                </h2>

                {featuredSignal ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <div className="mb-3 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                      {featuredSignal.type}
                    </div>

                    <h3 className="mb-4 text-2xl font-black">
                      {featuredSignal.title}
                    </h3>

                    <div className="space-y-3 text-sm text-gray-300">
                      <div>
                        Brand:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.brand}
                        </span>
                      </div>

                      <div>
                        Product:
                        <span className="ml-2 break-words font-semibold text-white">
                          {featuredSignal.product}
                        </span>
                      </div>

                      <div>
                        Network:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.network}
                        </span>
                      </div>

                      <div>
                        IAB:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.iabClass}
                        </span>
                      </div>

                      <div>
                        Confidence:
                        <span className="ml-2 font-semibold text-white">
                          {featuredSignal.confidence ?? featuredSignal.iabConfidence ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm text-gray-400">
                    No monitoring signals found yet.
                  </div>
                )}

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/24 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-cyan-200">
                      Pipeline Status
                    </div>
                    <InfoTooltip text="This describes the intended intelligence pipeline: raw monitoring row, entity extraction, graph linking, classification, then Brand Galaxy insight generation." />
                  </div>

                  <div className="space-y-3 text-sm text-gray-300">
                    <div>✦ Entity extraction ready</div>
                    <div>✦ Graph linking active</div>
                    <div>✦ IAB classification layer prepared</div>
                    <div>✦ Brand Galaxy insight generation enabled</div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/24 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-fuchsia-200">
                      Active Grouping
                    </div>
                    <InfoTooltip text="Grouping does not change the raw data. It only changes how the monitoring feed is organized for review: by campaign, product or brand." />
                  </div>

                  <div className="text-sm leading-6 text-gray-300">
                    {groupModeDescription}
                  </div>
                </div>
              </aside>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                    Signal Feed
                  </div>
                  <InfoTooltip text="The Monitoring Intelligence Feed shows live classified ad records from the ARGUS public API, grouped by campaign, product or brand." />
                </div>

                <h2 className="mb-2 text-3xl font-black">
                  Monitoring Intelligence Feed
                </h2>

                <p className="mb-6 text-sm leading-6 text-gray-400">
                  Each card now represents one grouped ARGUS intelligence object. Use
                  the controls below to review live ad data by campaign,
                  product, or brand.
                </p>

                <div className="mb-6 flex flex-wrap gap-3">
                  {[
                    { key: "campaign", label: "Group by Campaign" },
                    { key: "product", label: "Group by Product" },
                    { key: "brand", label: "Group by Brand" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setGroupMode(mode.key as GroupMode)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition duration-300 ${
                        groupMode === mode.key
                          ? "border-cyan-300/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.1)]"
                          : "border-white/10 bg-black/25 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {groupedSignals.length === 0 ? (
                  <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 text-gray-300">
                    No ARGUS monitoring signals available yet. Check the API route or try again after the ARGUS service has data.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedSignals.map((group) => {
                      const primarySignal = group.signals[0];

                      return (
                        <div
                          key={group.key}
                          className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-[0_0_35px_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-black/40"
                        >
                          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                              <div className="mb-3 inline-flex rounded-full border border-green-300/30 bg-green-500/10 px-3 py-1 text-xs text-green-200">
                                GROUPED BY {groupMode.toUpperCase()}
                              </div>

                              <h3 className="break-words text-2xl font-black text-white">
                                {group.key}
                              </h3>

                              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                                This grouped object contains {group.count} signal
                                {group.count === 1 ? "" : "s"} connected to{" "}
                                {group.products.length} product
                                {group.products.length === 1 ? "" : "s"},{" "}
                                {group.brands.length} brand
                                {group.brands.length === 1 ? "" : "s"} and{" "}
                                {group.campaigns.length} campaign
                                {group.campaigns.length === 1 ? "" : "s"}.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <div className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">
                                {group.count} signal
                                {group.count === 1 ? "" : "s"}
                              </div>

                              <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-3 text-fuchsia-100">
                                {group.products.length} product
                                {group.products.length === 1 ? "" : "s"}
                              </div>

                              <div className="rounded-2xl border border-green-300/30 bg-green-500/10 px-4 py-3 text-green-100">
                                {group.brands.length} brand
                                {group.brands.length === 1 ? "" : "s"}
                              </div>
                            </div>
                          </div>

                          <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                                Related Products
                                <InfoTooltip text="Products found inside this group. When grouped by product, this usually shows the canonical product object for the group." />
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {group.products.slice(0, 6).map((product) => (
                                  <div key={product}>{product}</div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                                Related Campaigns
                                <InfoTooltip text="Campaigns found inside this group. When grouped by campaign, this shows the campaign object plus any duplicate or related campaign labels." />
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {group.campaigns.slice(0, 6).map((campaign) => (
                                  <div key={campaign}>{campaign}</div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-green-300">
                                Related Brands
                                <InfoTooltip text="Brands found inside this group. This helps distinguish commercial brands from legal companies or owners." />
                              </div>

                              <div className="space-y-2 text-sm text-gray-300">
                                {group.brands.slice(0, 6).map((brand) => (
                                  <div key={brand}>{brand}</div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                Primary Advertiser
                                <InfoTooltip text="The first advertiser detected inside this grouped object. Additional advertisers appear in the grouped hierarchy if present." />
                              </div>
                              <div className="break-words font-bold">
                                {primarySignal.advertiser}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                Primary Brand
                                <InfoTooltip text="The first brand detected inside this grouped object. Brand grouping is based on normalized display labels from the current monitoring feed." />
                              </div>
                              <div className="break-words font-bold">
                                {primarySignal.brand}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                Primary Product
                                <InfoTooltip text="The first product detected inside this grouped object. Product-level normalization is the next phase, especially for variants like Zero Sugar / Coke Zero." />
                              </div>
                              <div className="break-words font-bold">
                                {primarySignal.product}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                              <div className="mb-1 flex items-center justify-between gap-2 text-sm text-gray-400">
                                IAB Class
                                <InfoTooltip text="Classification based on IAB taxonomy when imported. If missing, this field explicitly says that mapping is pending instead of hiding the absence." />
                              </div>
                              <div className="break-words font-bold">
                                {group.iabClasses[0] ||
                                  "Unclassified / pending IAB mapping"}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                Confidence: {group.iabConfidence[0] || "None"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {group.signals.slice(0, 4).map((signal) => (
                              <div
                                key={signal.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                              >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                                    {signal.type}
                                  </div>

                                  {signal.duration && (
                                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-300">
                                      {signal.duration} sec
                                    </div>
                                  )}

                                  {signal.spotCode && (
                                    <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
                                      Ad: {signal.spotCode}
                                    </div>
                                  )}

                                  {signal.riskLabels?.length > 0 && (
                                    <div className="rounded-full border border-red-300/20 bg-red-500/10 px-3 py-1 text-xs text-red-100">
                                      {signal.riskLabels.length} observation tag{signal.riskLabels.length === 1 ? "" : "s"}
                                    </div>
                                  )}
                                </div>

                                <div className="font-semibold text-white">
                                  {signal.title}
                                </div>

                                <div className="mt-2 text-sm leading-6 text-gray-400">
                                  {signal.description}
                                </div>

                                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                                  Source: {signal.source} · Classification:{" "}
                                  {signal.classificationSource}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4 text-sm leading-6 text-fuchsia-100">
                            Grouping view: this card summarizes multiple
                            monitoring signals around one{" "}
                            {groupMode === "campaign"
                              ? "campaign"
                              : groupMode === "product"
                              ? "product"
                              : "brand"}{" "}
                            object. Switch the grouping mode above to inspect
                            the same dataset from another perspective.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
