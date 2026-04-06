export function forgot_password(email){
    return (
        {
            status : 200,
            error : ""
        }
    );
}

export function generate_otp(email){
    return (
        {
            status : 200,
            error : ""
        }
    );
}

export function login(email, password){
    return (
        {
            status : 200,
            messeage : "user registered sucessfully",
        }
    );
}

export function refresh(){
    return (
        {
            status : 200,
            error : ""
        }
    );
}

export function register(name, email, phone, address, password, otp){
    return (
        {
            status : 201,
            messeage : "user registered sucessfully",
        }
    );
}

export function reset_password(email, otp, new_otp){
    return (
        {
            status : 200,
            message : "password reset sucessfull",
            error : ""
        }
    );
}