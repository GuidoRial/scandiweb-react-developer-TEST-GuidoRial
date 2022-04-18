import "./App.css";
import { Component } from "react";
import { client } from "./index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
    getItems,
    getAllProducts,
    getItemsByCategory,
    getCategories,
    getCurrencies,
    getItemsById,
} from "./queries";
import ProductListingPage from "./components/ProductListingPage/ProductListingPage";
import ProductDescriptionPage from "./components/ProductDescriptionPage/ProductDescriptionPage";
import Cart from "./components/Cart/Cart";
import Header from "./components/Header/Header";

class App extends Component {
    constructor() {
        super();
        this.state = {
            categories: [],
            currentCategory: "all",
            selectedCurrency: "$",
            cartItems: [],
            storeItems: [],
        };
        console.log(this.state);

        const fetchCategories = async () => {
            const result = await client
                .query({
                    query: getCategories,
                })
                .then((result) => {
                    const categories = result.data.categories;
                    this.state.categories = categories;
                });
        };

        const fetchStoreItems = async (category) => {
            const result = await client
                .query({
                    query: getItemsByCategory,
                    variables: {
                        title: category,
                    },
                })
                .then((result) => {
                    const items = result.data.category.products;
                    this.state.storeItems = items;
                });
        };

        fetchCategories();
        fetchStoreItems(this.state.currentCategory);
    }

    getProductFromCart(product) {
        return this.state.cartItems.find((item) => item.id === product.id);
    }
    updateCartQuantity(operation, product) {
        const indexOfProduct = this.state.cartItems.findIndex(
            (item) => item.id === product.id
        );

        const products = [...this.state.cartItems];

        if (operation === "add") {
            products[indexOfProduct].quantity += 1;
        } else {
            products[indexOfProduct].quantity -= 1;
        }

        return products;
    }
    emptyCart = () => {
        this.setState({ cartItems: [] });
    };
    handleAddProduct = (product) => {
        let updatedProductList;

        if (this.getProductFromCart(product)) {
            updatedProductList = this.updateCartQuantity("add", product);
        } else {
            updatedProductList = [
                ...this.state.cartItems,
                { ...product, quantity: 1 },
            ];
        }

        this.setState({ cartItems: updatedProductList });
    };
    handleRemoveProduct = (product) => {
        let updatedProductList;

        if (this.getProductFromCart(product).quantity > 1) {
            updatedProductList = this.updateCartQuantity("substract", product);
        } else {
            updatedProductList = this.state.cartItems.filter(
                (item) => item.id === product.id
            );
        }

        this.setState({ cartItems: updatedProductList });
    };

    render() {
        return (
            <div className="App">
                <BrowserRouter>
                    <Header />

                    <Routes>
                        <Route path="/" element={<ProductListingPage />} />
                        <Route
                            path="/products/:id"
                            element={<ProductDescriptionPage />}
                        />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
