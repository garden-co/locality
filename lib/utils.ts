import { clsx, type ClassValue } from 'clsx';
import { formatDistance } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function getTwoLettersFromString(org: string) {
   if (org.split(' ').length === 1) {
      return org.slice(0, 2).toUpperCase();
   }
   return org
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
}

export function getThreeLettersFromString(org: string) {
   // if the org has one word, get the first three letters
   if (org.split(' ').length === 1) {
      return org.slice(0, 3).toUpperCase();
   }

   //if the org has two or more words, get the first three letters of each word
   return org
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
}

export function generateSlug(name: string): string {
   return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export function getTimeAgo(date: Date): string {
   return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

/**
 * Get initials from a name
 * @param name The full name
 * @returns Initials (first letter of first and last name)
 */
export function getInitials(name: string): string {
   if (!name) return '';

   const parts = name.split(' ');
   if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

   return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generates a string of 4 random alphanumeric uppercase characters
 * @returns A string of 4 random characters from [0-9, A-Z]
 */
export function generateRandomCode(): string {
   const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   let result = '';

   for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
   }

   return result;
}
