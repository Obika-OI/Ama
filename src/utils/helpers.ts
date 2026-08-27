import { Activity } from "../types";
import { QUEST_POOL } from '../constants';
import { LOCAL_REGIONS_DATABASE } from '../constants/babyData';

export const formatCost = (costStr: string, targetCurrency: string) => {
  if (!costStr) return '';
  const numericVal = parseFloat(costStr.replace(/[^0-9.]/g, ''));
  if (isNaN(numericVal)) return costStr;

  let baseUSD = numericVal;
  if (costStr.includes('₦')) baseUSD = numericVal / 1500;
  else if (costStr.includes('¥')) baseUSD = numericVal / 150;
  else if (costStr.includes('£')) baseUSD = numericVal / 0.78;
  else if (costStr.includes('€')) baseUSD = numericVal / 0.92;

  if (targetCurrency === '₦') {
    return `₦${Math.round(baseUSD * 1500)}`;
  }
  if (targetCurrency === '¥') {
    return `¥${Math.round(baseUSD * 150)}`;
  }
  if (targetCurrency === '£') {
    return `£${(baseUSD * 0.78).toFixed(2)}`;
  }
  if (targetCurrency === '€') {
    return `€${(baseUSD * 0.92).toFixed(2)}`;
  }
  return `$${baseUSD.toFixed(2)}`;
};

export const getIngredientImage = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('plantain') || n.includes('banana')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('carrot')) {
    return 'https://images.unsplash.com/photo-1590865507245-51368572167e?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('milk') || n.includes('formula') || n.includes('yogurt') || n.includes('breastmilk')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('oat') || n.includes('powder') || n.includes('brown') || n.includes('cereal') || n.includes('flour')) {
    return 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('water')) {
    return 'https://images.unsplash.com/photo-1548839140-29a8c1f930c1?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('bean') || n.includes('beans')) {
    return 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('onion')) {
    return 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('oil')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('fish') || n.includes('salmon')) {
    return 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('crayfish') || n.includes('shrimp')) {
    return 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('yam') || n.includes('potato') || n.includes('sweet potato')) {
    return 'https://images.unsplash.com/photo-1596003906949-67221c377f6c?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('ugu') || n.includes('leaf') || n.includes('leaves') || n.includes('spinach') || n.includes('mint')) {
    return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('egg') || n.includes('eggy')) {
    return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('corn')) {
    return 'https://images.unsplash.com/photo-1551754625-7fc5b94523fd?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('avocado')) {
    return 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('apple')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('pear')) {
    return 'https://images.unsplash.com/photo-1514801115160-5807755866ef?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('blueberry') || n.includes('blueberries') || n.includes('berry') || n.includes('berries')) {
    return 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('pea') || n.includes('peas')) {
    return 'https://images.unsplash.com/photo-1587334206596-f00e572097e1?auto=format&fit=crop&w=150&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=150&q=80';
};

export const ENCRYPTION_KEY = "AmaBabyCareSecureKey_v1";

export const encryptString = (text: string): string => {
  if (!text) return '';
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return 'enc_' + btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    return text;
  }
};

export const decryptString = (cipherText: string): string => {
  if (!cipherText || !cipherText.startsWith('enc_')) return cipherText;
  try {
    const rawCipher = decodeURIComponent(escape(atob(cipherText.substring(4))));
    let result = '';
    for (let i = 0; i < rawCipher.length; i++) {
      const charCode = rawCipher.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    return cipherText;
  }
};

export const encryptPayload = (payload: any): string => {
  return encryptString(JSON.stringify(payload));
};

export const decryptPayload = (cipherText: string): any => {
  const decryptedStr = decryptString(cipherText);
  try {
    return JSON.parse(decryptedStr);
  } catch (e) {
    console.error("Failed to parse decrypted payload:", e);
    return null;
  }
};

export const processCloudData = (docData: any) => {
  if (docData && docData.encryptedPayload) {
    const decrypted = decryptPayload(docData.encryptedPayload);
    if (decrypted) {
      return { ...decrypted, updatedAt: docData.updatedAt };
    }
  }
  return docData;
};


export const calculateBabyAge = (dobString: string): string => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return '';
  
  const diffTime = today.getTime() - birthDate.getTime();
  if (diffTime < 0) return 'Newborn';
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return diffDays <= 1 ? '1 Day' : `${diffDays} Days`;
  }
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 Week' : `${diffWeeks} Weeks`;
  }
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalMonths = years * 12 + months;
  
  if (totalMonths < 24) {
    return totalMonths === 1 ? '1 Month' : `${totalMonths} Months`;
  } else {
    if (months === 0) {
      return `${years} Years`;
    }
    return `${years} Years ${months} ${months === 1 ? 'Month' : 'Months'}`;
  }
};

export const drawThreeRandomQuests = (): Activity[] => {
  const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map(q => ({
    ...q,
    isCompleted: false
  }));
};


