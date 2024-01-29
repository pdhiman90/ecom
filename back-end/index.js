const express = require('express');
require('./DB/config');
const User = require('./DB/user');
const cors = require('cors');
const Product = require('./DB/Product');
const Jwt = require('jsonwebtoken')
const JwtKey = 'e-comm';
const app = express();


app.use(express.json());
app.use(cors());
app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete
    result.password;
    Jwt.sign({ result }, JwtKey, { expiresIn: '2h' }, (error, token) => {
        if (error) {
            res.send({ result: 'Something went wrong...' });
        }
        res.send({ result, auth: token });
    });
})
app.post("/login", async (req, res) => {
    console.log(req.body);
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, JwtKey, { expiresIn: '2h' }, (error, token) => {
                if (error) {
                    res.send({ result: 'Something went wrong...' });
                }
                res.send({ user, auth: token });
            });

        } else {
            res.send({ result: 'No user Found' });
        }
    } else {
        res.send({ result: 'No user Found' });
    }

})
app.post('/add-product', async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);
})
app.get("/products", async (req, res) => {
    let products = await Product.find();
    if (products.length > 0) {
        res.send(products);
    } else {
        res.send({ result: ' No products found' })
    }
})
app.delete("/product/:id", async (req, res) => {
    let result = await Product.deleteOne({ _id: req.params.id });
    res.send(result);
});
app.get("/product/:id", async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    }
    else {
        res.send({ result: "Result not Found..." });
    }
});
app.put("/product/:id", async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );
    res.send(result);
});
app.get("/search/:key", async (req, res) => {
    let result = await Product.find({
        "$or": [
            {
                name: { $regex: req.params.key }

            },
            {
                company: { $regex: req.params.key }
            },
            {
                category: { $regex: req.params.key }
            }
        ]
    });
    res.send(result);
});
app.listen(8000);