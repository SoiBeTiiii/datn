export default interface BrandProps {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    is_active?: number;
    is_featured?: number;
    created_at?: string;
    updated_at?: string;
    delete_at?: string;
}