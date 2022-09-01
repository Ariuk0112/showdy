const request = require('superagent');
const db = require('../../db');
const onesignal = require('../../onesignal');
const chat = require('../../../chat');
const mail = require('../../mail');


module.exports = {
    submit: (req, res) => {

        if (typeof req.body.username == 'undefined') {
            return res.json({
                success: 0,
                message: 'username is missing'
            })
        }

        db.query("call sp_submit_order(?,?)",
            [req.body.order_id, req.data.op_id],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                chat.sendNotifStatus({ order: req.body.order_id });

                mail.sendMail({
                    title: `Order ${req.body.order_id}`,
                    to: req.body.username,
                    htmlPath: 'submit.html',
                    replacements: {
                        order: req.body.order_id,
                    }
                })

                return res.json({
                    success: 1,
                    data: results[0]
                })

            })
    },
    addstep: (req, res) => {

        if (typeof req.body.username == 'undefined') {
            return res.json({
                success: 0,
                message: 'username is missing'
            })
        }

        let order_id = req.body.order_id
        db.query("call sp_addstep_order(?,?,?,?,?)",
            [
                req.body.order_id,
                req.body.step_id,
                req.body.step_des,
                req.body.step_des_eng,
                req.body.step_group
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                let isMN = results[0][0]['acc_lang'] == 'MNG';

                chat.sendNotifStatus({ order: order_id });
                onesignal.send(results[0][0]['acc_username'], `${isMN ? 'Захиалга' : 'Order'} ${order_id}`, results[0][0][isMN ? 'step_des' : 'step_des_eng'])
                mail.sendMail({
                    title: `${isMN ? 'Захиалга' : 'Order'} ${order_id} - ${results[0][0][isMN ? 'step_des' : 'step_des_eng']}`,
                    to: results[0][0]['acc_username'],
                    htmlPath: 'status.html',
                    replacements: {
                        order: order_id,
                        status: results[0][0][isMN ? 'step_des' : 'step_des_eng'],
                    }
                })

                return res.json({
                    success: 1,
                    data: results[0]
                })

            })
    },
    close: (req, res) => {
        db.query("call sp_close_order(?)",
            [req.body.order_id],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                chat.sendNotifStatus({ order: req.body.order_id });

                return res.json({
                    success: 1,
                    data: results[0]
                })

            })
    },
    listNew: (req, res) => {
        db.query(`
SELECT 
    step.step_des,
    step.step_id,
    om.order_id,
    om.order_status,
    acc.acc_status,
    acc_fname,
    acc_lname,
    acc_phonenum,
    acc_username,
    om.order_created_date,
    round(om.order_orig_amount_total/100,2) as total_orig_amount,
    round(om.order_charge_amount_total/100,2) as total_charge_amount
FROM
    t_account acc,
    t_order_master om,
    t_order_steps step
WHERE
    acc.acc_id = om.acc_id
        AND om.order_id = step.order_id
        AND om.order_current_step_histno = step.step_histno
        AND om.order_status != 'o'
ORDER BY om.order_created_date DESC
LIMIT 30;`,
            [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    sum: (req, res) => {
        db.query("SELECT * FROM t_order_master", [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    account: (req, res) => {
        db.query("SELECT * FROM t_account;", [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },

    weeklysum: (req, res) => {
        db.query(`
SELECT SUM(order_charge_amount_total)/100 AS niit
FROM t_order_master
WHERE order_ordered_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW();
        `,
            [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    adminname: (req, res) => {
        db.query("SELECT op_des as Operatorname FROM t_operator;", [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    monthly: (req, res) => {
        db.query(`
SELECT SUM(order_charge_amount_total)/100 AS niilber
FROM t_order_master
where order_ordered_date between date_sub(now(),INTERVAL 1 month) and now();
        `,
            [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    orname: (req, res) => {

        db.query(`
SELECT 
    step.step_des,
    om.order_id,
    om.order_status,
    acc.acc_status,
    acc_fname,
    acc_lname,
    acc_phonenum,
    acc_username,
    om.order_created_date as item_assigned_date,
    ROUND(order_orig_amount_total/100,2) AS item_total_orig_amount,
    ROUND(order_charge_amount_total/100,2) AS item_total_charge_amount
FROM t_account acc,
    t_order_master om,
    t_order_steps step
WHERE acc.acc_id = om.acc_id
AND om.order_id = step.order_id
AND om.order_current_step_histno = step.step_histno
AND om.order_id = ?
AND om.order_status != 'o'`,
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    itemselect: (req, res) => {

        db.query("SELECT * FROM t_order_details where order_id = ? ",
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    userlist: (req, res) => {
        db.query(`SELECT ac.acc_stat,ac.acc_id, 
        ac.acc_status, 
        ac.acc_username, 
        ac.acc_fname, 
        ac.acc_lname, 
        ac.acc_phonenum, 
        ac.acc_created_date, 
        ad.acc_group
        FROM t_account ac,
        t_account_group ad
        where ac.acc_stat = ad.acc_id
        ORDER BY ac.acc_created_date DESC LIMIT 30;`, [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    searcher: (req, res) => {
        db.query("SELECT sh_text, sh_id FROM t_search_history ORDER BY sh_created_date desc limit 30 ;", [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    loadMessages: (req, res) => {
        db.query("call sp_get_messages(?, ?, 50)",
            [
                req.params.order_id,
                req.params.last_chatid
            ],
            (err, results) => {
                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results[0]
                })

            })
    },
    selectstep: (req, res) => {
        db.query("SELECT * FROM t_step;", [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    chatlist: (req, res) => {
        db.query(`SELECT 
        Order_id, 
        msg, 
        created_date 
        FROM (
            SELECT * FROM t_chat_details where direction = 'client'
            ORDER BY created_date desc limit 100
        ) AS sub
        GROUP BY order_id `, [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    filterlist: (req, res) => {
        db.query(`
SELECT 
    step.step_des,
    step.step_id,
    om.order_id,
    om.order_status,
    acc.acc_status,
    acc_fname,
    acc_lname,
    acc_phonenum,
    acc_username,
    om.order_created_date,
    round(om.order_orig_amount_total/100,2) as total_orig_amount,
    round(om.order_charge_amount_total/100,2) as total_charge_amount
FROM
    t_account acc,
    t_order_master om,
    t_order_steps step
WHERE
    acc.acc_id = om.acc_id
        AND om.order_id = step.order_id
        AND om.order_current_step_histno = step.step_histno
        AND om.order_status != 'o'
        AND step.step_id = ?
ORDER BY om.order_created_date DESC
LIMIT 30;`,
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    filterlistdate: (req, res) => {
        db.query(`
        SELECT 
        step.step_des,
        step.step_id,
        om.order_id,
        om.order_status,
        acc.acc_status,
        acc_fname,
        acc_lname,
        acc_phonenum,
        acc_username,
        om.order_created_date,
        round(om.order_orig_amount_total/100,2) as total_orig_amount,
        round(om.order_charge_amount_total/100,2) as total_charge_amount
    FROM
        t_account acc,
        t_order_master om,
        t_order_steps step
    WHERE
        acc.acc_id = om.acc_id
            AND om.order_id = step.order_id
            AND om.order_current_step_histno = step.step_histno
            AND om.order_status != 'o'
            AND om.order_created_date >=DATE(NOW()) - INTERVAL ? DAY
    ORDER BY om.order_created_date DESC;`,
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    searchorder: (req, res) => {
        db.query(`
SELECT 
    step.step_des,
    step.step_id,
    om.order_id,
    om.order_status,
    acc.acc_status,
    acc_fname,
    acc_lname,
    acc_phonenum,
    acc_username,
    om.order_created_date,
    round(om.order_orig_amount_total/100,2) as total_orig_amount,
    round(om.order_charge_amount_total/100,2) as total_charge_amount
FROM
    t_account acc,
    t_order_master om,
    t_order_steps step
WHERE
    acc.acc_id = om.acc_id
        AND om.order_id = step.order_id
        AND om.order_current_step_histno = step.step_histno
        AND om.order_status != 'o'
        AND om.order_id Like ?
ORDER BY om.order_created_date DESC
LIMIT 30;`,
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    orddet: (req, res) => {
        db.query(`select acc_id,
        ceil(order_charge_amount_total/100) as order_charge_amount_total, 
        ceil(order_orig_amount_total/100) as order_orig_amount_total, 
        ceil(order_charge_tax/100) as order_charge_tax, 
        ceil(order_charge_weight/100) as order_charge_weight, 
        ceil(order_charge_fee/100) as order_charge_fee,
        ceil( order_charge_amount_total/100 - order_charge_amount_prepay/100) as balance,
        DATE_FORMAT(order_arrive_date, "%Y-%d-%m") as order_arrive_date,
        ceil(order_charge_amount_prepay/100) as order_charge_amount_prepay,
        DATE_FORMAT(order_delivery_date, "%Y-%d-%m") as order_delivery_date
        from t_order_master where order_id = ?`,
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },

    accountdetail: (req, res) => {
        db.query("SELECT * FROM t_account where acc_id = ?;",
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    accgroupfilter: (req, res) => {
        db.query(`SELECT ac.acc_stat, 
        ac.acc_id, 
        ac.acc_status, 
        ac.acc_username, 
        ac.acc_fname, 
        ac.acc_lname, 
        ac.acc_phonenum, 
        ac.acc_created_date, 
        ad.acc_group
        FROM t_account ac,
        t_account_group ad
        where ac.acc_stat = ad.acc_id
        and ac.acc_stat= ?
        ORDER BY ac.acc_created_date DESC
        LIMIT 30;`,
            [
                req.query.field1
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    updatestat: (req, res) => {
        db.query(`UPDATE t_account SET acc_stat = ?
        WHERE acc_id= ? ;`,
            [
                req.body.field1,
                req.body.field2
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    category: (req, res) => {
        db.query("SELECT id, parent_id, show_on_menu, name_mongolian, name_english, amazon_search_keyword, weight FROM categories ORDER BY id desc limit 30 ;", [],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    insertcategory: (req, res) => {
        db.query(`INSERT INTO categories (parent_id, show_on_menu, name_mongolian, name_english, amazon_search_keyword, weight)  
        VALUES (?, ?, ?, ?, ?, ?);`,
            [
                req.body.field1,
                req.body.field2,
                req.body.field3,
                req.body.field4,
                req.body.field5,
                req.body.field6
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                return res.json({
                    success: 1,
                    data: results
                })

            })
    },
    UpdateOrderAmount: (req, res) => {
   
        db.query("call sp_update_order(?,?,?,?,?,?,?,?,?,?)",
            [                        
                req.body.pi_op_id,                
                req.body.pi_order_arrive_date,
                req.body.pi_order_delivery_date, 
                req.body.pi_orig_amount,
                req.body.pi_new_total_amount,
                req.body.pi_prepay,
                req.body.pi_tax,
                req.body.pi_charge_weight,
                req.body.pi_charge_fee,
                req.body.pi_paid,
                req.body.pi_order_id
            ],
            (err, results) => {

                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    return res.json({
                        success: 0,
                        message: err.message.replace('ER_SIGNAL_EXCEPTION: ', '')
                    })
                }
                else if (err) {
                    return res.status(500).json({
                        success: 0,
                        message: err.message
                    })
                }

                // QPOS variables
                const orderID = results[0][0]['order_id']
                const orderPrepaymentAmount = results[0][0]['remain_prepay']
                const username = results[0][0]['acc_username']
                const isMN = results[0][0]['acc_lang']=='MNG'
                // QPOS settings
                const QPOS_URL = process.env.QPOS_URL;
                const QPOS_KEY = process.env.QPOS_KEY;
                const QPOS_MERCHANT = process.env.QPOS_MERCHANT;
                const QPOS_POS = process.env.QPOS_POS;


                // QPOS object
                const qpos_input = {
                    payeeCode: `${QPOS_MERCHANT}`,
                    posNo: `${QPOS_POS}`,
                    tranAmnt: orderPrepaymentAmount,
                    tranCur: "MNT",
                    tranDesc: `${username} - ${orderID}`,
                    invoiceId: `${orderID}`,
                    paidLimit: 10
                };

                console.log(`${QPOS_URL}/resources/merch/v1.0/createqr?api_key=${QPOS_KEY}`);
                console.log(qpos_input);

                chat.sendNotifStatus({ order: req.body.order_id });
                //onesignal.send(username, `${isMN ? 'Захиалга' : 'Order'} ${orderID}`, results[0][0][isMN ? 'step_des' : 'step_des_eng'])
                mail.sendMail({
                    title: `Order ${orderID}`,
                    to: username,
                    htmlPath: 'submit.html',
                    replacements: {
                        order: orderID,
                    }
                })

                request.post(`${QPOS_URL}/resources/merch/v1.0/createqr?api_key=${QPOS_KEY}`)
                    .send(qpos_input)
                    .set('Accept', 'application/json')
                    .then(response => {

                        db.query("insert into t_qpos_history (qr_username, qr_order_id, qr_order_amount, responseCode, responseDesc, qrCode, qrLink, qpayAccountId) values(?,?,?,?,?,?,?,?)",
                            [
                                username,
                                orderID,
                                orderPrepaymentAmount,
                                response.body.responseCode,
                                response.body.responseDesc,
                                response.body.qrCode,
                                response.body.qrLink,
                                response.body.qpayAccountId,
                            ],
                            () => { })

                        console.log(response.body)
                        return res.json({
                            success: 1,
                            data: results[0], // db result
                            qpos: response.body // qrcode result
                        })
                    })
                    .catch(err => {
                        console.log(`ERROR Order: ${orderID} QPOS status: ${err.response.status}: ${err.response.text}`)
                        return res.json({
                            success: 0,
                            text: err.response
                        })
                    });
            })
    },
}
