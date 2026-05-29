import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createClient();
    try {
        // Fetch customers with their latest balance from the Ledger table
        const { data, error } = await supabase
            .from('Customer')
            .select(`
                *,
                ledger_entries:Ledger (
                    new_debt,
                    created_at,
                    id,
                    type,
                    amount
                )
            `)
            .order('name', { ascending: true })
            .order('created_at', { foreignTable: 'Ledger', ascending: false })
            .order('id', { foreignTable: 'Ledger', ascending: false });

        if (error) throw error;

        const transformedData = (data || []).map((customer: any) => {
            const entries = customer.ledger_entries || [];
            const sortedEntries = [...entries].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const totalPaid = entries.filter((e: any) => e.type === 'PAYMENT').reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
            return {
                ...customer,
                current_balance: sortedEntries.length > 0 ? sortedEntries[0].new_debt : 0,
                total_paid: totalPaid,
                last_transaction_type: sortedEntries.length > 0 ? sortedEntries[0].type : null
            };
        });

        return NextResponse.json(transformedData);
    } catch (error: any) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, gender, phone, customer_code } = body;
    const supabase = await createClient();

    try {
        // 1. Create the User account first
        const { data: userData, error: userError } = await supabase
            .from('User')
            .insert({
                username: customer_code.toLowerCase().replace(/\s+/g, ''),
                email: `${customer_code.toLowerCase().replace(/\s+/g, '')}@dadwork.com`,
                name: name,
                password: '123', // Default password as requested
                role: 'CUSTOMER',
                is_active: true
            })
            .select()
            .single();

        if (userError) {
            console.error('Error creating linked user:', userError);
            // Proceed anyway to create customer, or throw? 
            // Let's log but proceed for now to avoid blocking business logic if auth fails
        }

        // 2. Create the Customer record
        const { data, error } = await supabase
            .from('Customer')
            .insert({
                name,
                customer_code: customer_code,
                gender: gender || null,
                phone: phone || null
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Create Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Creation failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supabase = await createClient();

    try {
        // First, delete all DailyBookItem records that reference this customer
        const { error: dailyBookItemError } = await supabase
            .from('DailyBookItem')
            .delete()
            .eq('customer_id', id);

        if (dailyBookItemError) {
            console.error('Delete DailyBookItem Error:', dailyBookItemError);
            throw dailyBookItemError;
        }

        // Then, delete all Ledger records that reference this customer
        const { error: ledgerError } = await supabase
            .from('Ledger')
            .delete()
            .eq('customer_id', id);

        if (ledgerError) {
            console.error('Delete Ledger Error:', ledgerError);
            throw ledgerError;
        }

        // Finally, delete the customer
        const { error } = await supabase
            .from('Customer')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 });
    }
}
export async function PATCH(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { name, gender, phone, customer_code } = body;
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('Customer')
            .update({
                name,
                customer_code,
                gender: gender || null,
                phone: phone || null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Update Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
