import { get_owed_bills } from "../services/api/bills"

export async function get_owed_bill_amount(){
    const bills = await get_owed_bills("pending");
    let amount = 0;

    bills.forEach(element => {
        amount += element.amount;
    });

    return amount;
}