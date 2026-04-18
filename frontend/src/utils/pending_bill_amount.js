import { get_bills } from "../services/api/bills"

export async function get_pending_bill_amount(){
    const bills = await get_bills("pending");
    let amount = 0;

    bills.forEach(element => {
        amount += element.amount;
    });

    return amount;
}