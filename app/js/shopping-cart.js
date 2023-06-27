import { getLoggedUser, logOut, getUsers } from "./get-modules.js";
let userName = document.querySelector(".header__nav--user");
let userLogout = document.querySelector(".header__logout");
let shoppingCart = document.querySelector(".header__shoppingcart--link");
let cartCount = document.querySelector(".header__shoppingcart--counter");
let tableArea = document.querySelector(".main__shoppingcart--tbody");
let orderButton = document.querySelector(".main__order--complete");
let orderTotalCounter = document.querySelector(".main__order--total-number");

checkLoggedUser(userName, userLogout, shoppingCart)
checkCart()
checkTotal()


orderButton.addEventListener('click', () => {
    completeOrder()
})
function checkLoggedUser() {
    let user = getLoggedUser();
    if (user.status) {
      userName.innerText = user.name;
      userName.href = "../account-page/index.html";
      userLogout.classList.add("header__logout-logged");
      userLogout.addEventListener("click", () => {
          logOut();
          window.location.replace("../../index.html");
      });
      shoppingCart.href = "#";
    }
  }
async function checkCart() {
    let loggedUser = getLoggedUser()
    let serverUserCart = await getUsers(loggedUser.id)
    serverUserCart = serverUserCart.shoppingCart
    changeCartCounter(serverUserCart)
    renderCart(serverUserCart)
}

function changeCartCounter(storeCounter = getLoggedUser().shoppingCart) {
  cartCount.innerText = storeCounter.length;
}
function renderCart(goodsArr) {
    for (let i = 0; i < goodsArr.length; i++){
        let component = document.createElement("tr");
        component.dataset.id = goodsArr[i].id
        if (goodsArr[i].sale == true) {
            component.innerHTML = `
            <tr class="main__shoppingcart--tr-body main__shoppingcart--tr-{$item}">
                <td class="main__shoppingcart--img-box" ><img class="main__shoppingcart--img" src="../../img/products/${goodsArr[i].img}.png" width="150px" height="150px" alt="${goodsArr[i].title}">${goodsArr[i].title}</td>
                <td class="main__shoppingcart--price">$${goodsArr[i].price}</td>
                <td class="main__shoppingcart--sale"><p class="main__shoppingcart--sale-number">-${goodsArr[i].salePercent}%</p></td>
                <td><input type="text" class="main__shoppingcart--quantity" value="${goodsArr[i].quantity}" oninput="if(parseInt(value) < 1) value = 1"></td>
                <td class="main__shoppingcart--total">$${goodsArr[i].price -    (goodsArr[i].price * (goodsArr[i].salePercent / 100))}</td>
                <td><img src="../../img/delete.png" class="main__shoppingcart--delete${goodsArr[i].id}" width="35px" height="35px" alt="delete"></td>
            </tr>
        `;
        } else {
            component.innerHTML = `
            <tr class="main__shoppingcart--tr-body main__shoppingcart--tr-{$item}">
                <td class="main__shoppingcart--img-box" ><img class="main__shoppingcart--img" src="../../img/products/${goodsArr[i].img}.png" width="150px" height="150px" alt="${goodsArr[i].title}">${goodsArr[i].title}</td>
                <td class="main__shoppingcart--price">$${goodsArr[i].price}</td>
                <td class="main__shoppingcart--sale"><p>-</p></td>
                <td><input type="text" class="main__shoppingcart--quantity" value="${goodsArr[i].quantity}" oninput="if(parseInt(value) < 1) value = 1"></td>
                <td class="main__shoppingcart--total">$${goodsArr[i].price}</td>
                <td><img src="../../img/delete.png" class="main__shoppingcart--delete${goodsArr[i].id}" width="35px" height="35px" alt="delete"></td>
            </tr>
        `;
        }
        tableArea.append(component)
        let itemDeleteButton = document.querySelector(
          `.main__shoppingcart--delete${goodsArr[i].id}`
        );
        let quantity = document.querySelector(
          `tr[data-id="${goodsArr[i].id}"] .main__shoppingcart--quantity`
        );
        itemDeleteButton.addEventListener('click', () => {
            deleteItem(goodsArr[i], goodsArr[i].id);
        })
        quantity.addEventListener("input", () => {
            let totalPrice = document.querySelector(
              `tr[data-id="${goodsArr[i].id}"] .main__shoppingcart--total`
            );
            let total
            if(goodsArr[i].salePercent){
                total = goodsArr[i].price * quantity.value - ((goodsArr[i].price * (goodsArr[i].salePercent / 100)))
            } else{
                total = goodsArr[i].price * quantity.value
            }
            totalPrice.innerText = `$${total}`;
            changeItem(goodsArr[i], quantity.value)
        });
    }
}

function changeItem(arr, quantity){
    arr.quantity = quantity
    let localUser = getLoggedUser()
    let updatedCart = localUser.shoppingCart.filter((el) => el.id !== arr.id)
    localUser.shoppingCart = updatedCart
    localUser.shoppingCart.push(arr)
    localStorage.setItem('loggedUser', JSON.stringify(localUser))
    localUser = getLoggedUser()
    checkTotal()
}

function deleteItem(delItem, id) {
    let item = document.querySelector(`tr[data-id="${id}"]`);
    let store = getLoggedUser();
    let updatedStore = store.shoppingCart.filter((el) => el.id !== delItem.id);
    store.shoppingCart = updatedStore;
    localStorage.setItem("loggedUser", JSON.stringify(store));
    item.remove();
    changeCartCounter(store.shoppingCart);
}

async function completeOrder(){
    let user = getLoggedUser()
    let oldOrders = user.orders
    let newOrders = user.shoppingCart 
    let orderedItems = {
        ...user,
        orders: [...oldOrders, ...newOrders]
    }
    console.log(orderedItems)

    for(let i = 0; i < newOrders.length; i++){
        console.log(newOrders[i])
        deleteItem(newOrders[i], newOrders[i].id)
    }
    let request = await fetch(
        `https://634e9f834af5fdff3a625f84.mockapi.io/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderedItems),
        }
      ).then((res) => res.json()); 
        user.orders = orderedItems.orders
        user.shoppingCart = []
        localStorage.setItem('loggedUser', JSON.stringify(user))
        changeCartCounter()
}

async function checkTotal() {
    let totalPrice
    let localUser = getLoggedUser()
    let cartArr = localUser
    cartArr = cartArr.shoppingCart
    let priceArr = cartArr.map((el) => {
        let total
        if(el.sale){
            total = el.price * el.quantity - (el.price * (el.salePercent / 100))
        } else{
            total = el.price * el.quantity
        }
        return total
    })
    if(priceArr.length > 0){
        totalPrice = priceArr.reduce((el, acc) => {
        return el + acc
    })
    orderTotalCounter.innerText = `$${totalPrice}`
    }
    
}

