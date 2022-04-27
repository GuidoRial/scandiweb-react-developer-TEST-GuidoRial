import { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { client } from "./index";
import { getProductsByCategory, getCategories, getCurrencies } from "./queries";
import ProductListingPage from "./components/ProductListingPage/ProductListingPage";
import ProductDescriptionPage from "./components/ProductDescriptionPage/ProductDescriptionPage";
import Cart from "./components/Cart/Cart";
import Header from "./components/Header/Header";
import "./App.css";

class App extends Component {
    constructor() {
        super();
        this.state = {
            categories: [],
            currentCategory: "all",
            currencies: [],
            selectedCurrency: "$",
            cartItems: [],
            storeItems: [],
        };

        this.fetchCategories = this.fetchCategories.bind(this);
        this.fetchStoreItems = this.fetchStoreItems.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.fetchCurrencies = this.fetchCurrencies.bind(this);
        this.handleSelectedCurrencyChange =
            this.handleSelectedCurrencyChange.bind(this);
        this.getProductFromCart = this.getProductFromCart.bind(this);
        this.updateCartQuantity = this.updateCartQuantity.bind(this);
        this.handleAddProduct = this.handleAddProduct.bind(this);
        this.handleRemoveProduct = this.handleRemoveProduct.bind(this);
    }

    /* MAKING THE STORE DYNAMIC */

    handleCategoryChange = (newCategory) => {
        this.setState({ currentCategory: newCategory });
        this.fetchStoreItems(newCategory);
    };

    handleSelectedCurrencyChange = (newSelectedCurrency) => {
        this.setState({
            selectedCurrency: newSelectedCurrency,
        });
    };

    /* INITIALIZING STORE  */
    fetchCategories = async () => {
        await client
            .query({
                query: getCategories,
            })
            .then((result) => {
                const categories = result.data.categories;
                this.setState({ categories: categories });
            });
    };

    fetchStoreItems = async (category) => {
        await client
            .query({
                query: getProductsByCategory,
                variables: {
                    title: category,
                },
            })
            .then((result) => {
                const items = result.data.category.products;
                this.setState({ storeItems: items });
            });
    };

    fetchCurrencies = async () => {
        await client
            .query({ query: getCurrencies })
            .then((result) =>
                this.setState({ currencies: result.data.currencies })
            );
    };

    componentDidMount() {
        this.fetchCategories();
        this.fetchStoreItems(this.state.currentCategory);
        this.fetchCurrencies();
    }

    /* ATTRIBUTES LOGIC */

    /* CART LOGIC  */
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

    handleAddProduct = (product, selectedAttributes) => {
        let updatedProductList;
        let productAlreadyInCart = this.getProductFromCart(product);

        if (productAlreadyInCart) {
            //If this product already exists in the cart
            //Check that the objects in both attributes array are the same (If I want to buy a blue and a white iPhone on the same session, I should be able to do that)
            const allAttributesAreTheSame = () => {
                const objectsAreEqual = (o1, o2) =>
                    Object.values(o1)[1] === Object.values(o2)[1];

                let truthyValuesCounter = 0;
                let i = 0;

                while (i < selectedAttributes.length) {
                    //Given that you can't add to cart unless you selected one attribute of each of the available ones for that product, the length of the product in cart and the one you're adding right now is always the same

                    if (
                        objectsAreEqual(
                            selectedAttributes[i],
                            productAlreadyInCart?.selectedAttributes[i]
                        )
                    ) {
                        truthyValuesCounter += 1;
                    }
                    i += 1;
                }

                if (truthyValuesCounter === selectedAttributes.length) {
                    return true;
                }
            };
            if (allAttributesAreTheSame()) {
                console.log("all attributes are the same");
            } else {
                console.log("there's a difference");
            }
        } else {
        }
        /* 
        If productAlreadyInCart
            check if productInCart.selectedAttributes === selectedAttributes
                if true, get that product and quantity += 1
                if false, add that product again (I'm going to need a different id??)

            else
                add it for the first time
        */
        if (this.getProductFromCart(product)) {
            updatedProductList = this.updateCartQuantity("add", product);
        } else {
            updatedProductList = [
                ...this.state.cartItems,
                {
                    ...product,
                    selectedAttributes,
                    /* unique productInCartId */ quantity: 1,
                },
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
                    <Header
                        categories={this.state.categories}
                        currentCategory={this.state.currentCategory}
                        handleCategoryChange={this.handleCategoryChange}
                        selectedCurrency={this.state.selectedCurrency}
                        currencies={this.state.currencies}
                        handleSelectedCurrencyChange={
                            this.handleSelectedCurrencyChange
                        }
                    />
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProductListingPage
                                    storeItems={this.state.storeItems}
                                    currentCategory={this.state.currentCategory}
                                    selectedCurrency={
                                        this.state.selectedCurrency
                                    }
                                    cartItems={this.state.cartItems}
                                    handleAddProduct={this.handleAddProduct}
                                />
                            }
                        />
                        <Route
                            path="/products/:id"
                            element={
                                <ProductDescriptionPage
                                    productId={this.state.productId}
                                    selectedCurrency={
                                        this.state.selectedCurrency
                                    }
                                    cartItems={this.state.cartItems}
                                    handleAddProduct={this.handleAddProduct}
                                    getProductFromCart={this.getProductFromCart}
                                    updateCartQuantity={this.updateCartQuantity}
                                />
                            }
                        />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
