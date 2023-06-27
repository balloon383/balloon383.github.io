import { getLoggedUser, getUsers, logOut } from "./get-modules.js";
let userName = document.querySelector(".header__nav--user");
let userLogout = document.querySelector(".header__logout");
let shoppingCart = document.querySelector(".header__shoppingcart--link");
let cartCount = document.querySelector(".header__shoppingcart--counter");
let userInfoName = document.querySelector('.main__info--name-name')
let userInfoEmail = document.querySelector(".main__info--email-email")
let tableArea = document.querySelector(".main__shoppingcart--tbody");
let deleteAccountButton = document.querySelector('.main__info--delete')
deleteAccountButton.addEventListener('click', () => {
  deleteAccount()
})

checkLoggedUser(userName, userLogout, shoppingCart)

changeCartCounter()

async function checkLoggedUser(userName, userLogout, shoppingCart) {
    let user = getLoggedUser();
    if (user.status) {
      userName.innerText = user.name;
      userName.href = "../account-page/index.html";
      userLogout.classList.add("header__logout-logged");
      userLogout.addEventListener("click", () => {
          logOut();
          window.location.replace("../../index.html");
      });
      shoppingCart.href = "../shopping-cart/index.html";
      userInfoName.innerText = user.name
      userInfoEmail.innerText = user.email
      console.log(user.orders.length)
      if(user.orders.length > 0){
        let serverUserOrders = await getUsers(user.id)
        serverUserOrders = serverUserOrders.orders
        renderCart(serverUserOrders)
      }
    }
  }

  function changeCartCounter(storeCounter = getLoggedUser().shoppingCart) {
    cartCount.innerText = storeCounter.length;
  }

  function renderCart(goodsArr) {
    console.log(goodsArr)
    for (let i = 0; i < goodsArr.length; i++){
        let component = document.createElement("tr");
        component.dataset.id = goodsArr[i].id
        if (goodsArr[i].sale == true) {
            component.innerHTML = `
            <tr class="main__shoppingcart--tr-body main__shoppingcart--tr-{$item}">
                <td class="main__shoppingcart--img-box" ><img class="main__shoppingcart--img" src="../../img/products/${goodsArr[i].img}.png" width="150px" height="150px" alt="${goodsArr[i].title}">${goodsArr[i].title}</td>
                <td class="main__shoppingcart--price">$${goodsArr[i].price}</td>
                <td class="main__shoppingcart--sale"><p class="main__shoppingcart--sale-number">-${goodsArr[i].salePercent}%</p></td>
                <td>${goodsArr[i].quantity}</td>
                <td class="main__shoppingcart--total">$${goodsArr[i].price * goodsArr[i].quantity - (goodsArr[i].price * (goodsArr[i].salePercent / 100))}</td>
            </tr>
        `;
        } else {
            component.innerHTML = `
            <tr class="main__shoppingcart--tr-body main__shoppingcart--tr-{$item}">
                <td class="main__shoppingcart--img-box" ><img class="main__shoppingcart--img" src="../../img/products/${goodsArr[i].img}.png" width="150px" height="150px" alt="${goodsArr[i].title}">${goodsArr[i].title}</td>
                <td class="main__shoppingcart--price">$${goodsArr[i].price}</td>
                <td class="main__shoppingcart--sale"><p>-</p></td>
                <td>${goodsArr[i].quantity}</td>
                <td class="main__shoppingcart--total">$${goodsArr[i].price * goodsArr[i].quantity}</td>
            </tr>
        `;
        }
        tableArea.append(component)
        
    }
}

async function deleteAccount(){
  let user = getLoggedUser()
  const deletion = await fetch(
    `https://634e9f834af5fdff3a625f84.mockapi.io/users/${user.id}`,
    {
      method: 'DELETE',
    }
  ).then((res) => res.json());
  localStorage.clear();
  window.location.replace("../../index.html");
}
