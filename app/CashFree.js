const { Cashfree } = require("cashfree-pg")
const { configDotenv } = require("dotenv")

const { error: dotenvError, parsed: dotenv } = configDotenv()
if (dotenvError) throw dotenvError



Cashfree.XClientId = dotenv.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = dotenv.CASHFREE_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


var getOrderId = () => Date.now() + ""


const createOrder = async (amount, cid, cphone) => {
    var request = {
        order_amount: amount,
        order_currency: "INR",
        order_id: getOrderId(),
        order_meta: {
            return_url: "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
        },
        customer_details: {
            customer_id: cid,
            customer_phone: cphone
        }
    };
    try {
        const order = await Cashfree.PGCreateOrder("2022-09-01", request)
        return { status: order.data }
    } catch (error) {
        return { error: error.response.data }
    }
}

const getStatus = async (id) => {
    try {
        const status = await Cashfree.PGOrderFetchPayments("2023-08-01", id)
        return { status: status.data[0] }
    } catch (error) {
        return { error: error.response.data }
    }
}


module.exports = {
    getStatus,
    createOrder
}