import { get_payments } from "../services/api/payments";

export async function get_money_spent_in_month(){
    const payments = await get_payments();

    let amount = 0;
    const now = new Date();

    payments.forEach( e => {
        const date = new Date(e.date);
        

        if(date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()){
            amount += e.amount;
        }
    });

    return amount;
}