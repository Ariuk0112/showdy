const router = require('express').Router();
const {
    submit,
    addstep,
    close,
    listNew,
    sum,
    account,
    weeklysum,
    adminname,
    monthly,
    orname,
    itemselect,
    userlist,
    searcher,
    loadMessages,
    selectstep,
    chatlist,
    filterlist,
    searchorder,
    orddet,
    filterlistdate,
    accountdetail,
    accgroupfilter,
    updatestat,
    category,
    insertcategory,
    UpdateOrderAmount,
} = require('./controller')

router.post('/submit', submit);
router.post('/addstep', addstep);
router.post('/close', close);
router.get('/list', listNew);
router.get('/sum', sum);
router.get('/account', account);
router.get('/weeklysum', weeklysum);
router.get('/adminname', adminname);
router.get('/monthly', monthly);
router.get('/orname', orname);
router.get('/itemselect', itemselect);
router.get('/userlist', userlist);
router.get('/searcher', searcher);
router.get('/messages/:order_id/:last_chatid',  loadMessages);
router.get('/selectstep', selectstep);
router.get('/chatlist', chatlist);
router.get('/filterlist', filterlist);
router.get('/searchorder', searchorder);
router.get('/orddet', orddet);
router.get('/filterlistdate', filterlistdate);
router.get('/accountdetail', accountdetail);
router.get('/accgroupfilter', accgroupfilter);
router.post('/updatestat', updatestat);
router.get('/category', category);
router.post('/insertcategory', insertcategory);
router.post('/updateorderamount', UpdateOrderAmount);
module.exports = router;
