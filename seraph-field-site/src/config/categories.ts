import { BookOpen, Code2, FileText, Terminal, type LucideIcon } from 'lucide-react';
import type { Category } from '../types';

export interface CategoryItem {
  id: Category;
  label: string;
  archiveLabel: string;
  icon: LucideIcon;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'THEORY', label: 'THEORY', archiveLabel: 'THEORY', icon: BookOpen },
  { id: 'PAPER', label: 'PAPER', archiveLabel: 'PAPER', icon: FileText },
  { id: 'REPO', label: 'REPO', archiveLabel: 'REPO', icon: Code2 },
  { id: 'IMPLEMENT', label: 'IMPLEMENT', archiveLabel: 'IMPLEMENTATION', icon: Terminal },
];

export const DEFAULT_CATEGORY: Category = 'THEORY';

export const CATEGORY_ICON_MAP = Object.fromEntries(
  CATEGORY_ITEMS.map((item) => [item.id, item.icon]),
) as Record<Category, LucideIcon>;
