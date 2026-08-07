const CART_KEY='ggm-coaching-cart-v2';
let memoryCart=[];
const products={
  rewire:{id:'rewire',title:'Rewire Your Mind in 21 Days',image:'assets/book-rewire.png',price:null},
  teens:{id:'teens',title:'Mind Power 4 Teens Journal',image:'assets/book-mind-power.png',price:null}
};
function getCart(){try{const stored=JSON.parse(localStorage.getItem(CART_KEY))||[];memoryCart=stored;return stored}catch{return memoryCart}}
function saveCart(cart){memoryCart=cart;try{localStorage.setItem(CART_KEY,JSON.stringify(cart))}catch{}updateCount()}
function updateCount(){const count=getCart().reduce((s,i)=>s+i.qty,0);document.querySelectorAll('.cart-count').forEach(el=>el.textContent=count)}
function addToCart(id,qty=1){const cart=getCart();const existing=cart.find(i=>i.id===id);if(existing)existing.qty+=qty;else cart.push({...products[id],qty});saveCart(cart);showToast(`${products[id].title} added to cart`)}
function showToast(text){let toast=document.querySelector('.cart-toast');if(!toast){toast=document.createElement('div');toast.className='cart-toast';toast.style.cssText='position:fixed;right:22px;bottom:22px;background:#250d35;color:white;padding:16px 20px;z-index:9999;box-shadow:0 15px 40px rgba(0,0,0,.3);font:600 12px Montserrat,Arial;letter-spacing:.06em';document.body.appendChild(toast)}toast.textContent=text;toast.hidden=false;setTimeout(()=>toast.hidden=true,2600)}
document.querySelectorAll('[data-add-cart]').forEach(btn=>btn.addEventListener('click',()=>{const qtyInput=btn.closest('.product-actions')?.querySelector('.qty');addToCart(btn.dataset.addCart,Math.max(1,Number(qtyInput?.value||1)))}));
function renderCart(){const wrap=document.querySelector('[data-cart-items]');if(!wrap)return;const cart=getCart();if(!cart.length){wrap.innerHTML='<div class="empty-cart">Your cart is currently empty.<br><a class="btn btn-primary" href="books.html" style="margin-top:25px">Browse Books</a></div>';return}
wrap.innerHTML=cart.map((item,index)=>`<div class="cart-item"><img src="${item.image}" alt="${item.title}"><div><h3>${item.title}</h3><small>Price will be confirmed by GGM Coaching</small></div><input aria-label="Quantity for ${item.title}" type="number" min="1" value="${item.qty}" data-qty="${index}"><button class="remove-item" aria-label="Remove ${item.title}" data-remove="${index}">×</button></div>`).join('');
wrap.querySelectorAll('[data-qty]').forEach(input=>input.addEventListener('change',()=>{const c=getCart();c[Number(input.dataset.qty)].qty=Math.max(1,Number(input.value));saveCart(c);renderCart()}));
wrap.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{const c=getCart();c.splice(Number(btn.dataset.remove),1);saveCart(c);renderCart()}));
const summary=document.querySelector('[data-cart-summary]');if(summary)summary.innerHTML=`<p><strong>${cart.reduce((s,i)=>s+i.qty,0)}</strong> item(s)</p><p>Prices and delivery fees will be confirmed directly by GGM Coaching before payment.</p>`;
}
function populateCheckout(){const field=document.querySelector('[name="Order summary"]');if(!field)return;const cart=getCart();field.value=cart.map(i=>`${i.qty} × ${i.title}`).join('\n')||'No items in cart';}
updateCount();renderCart();populateCheckout();
window.GGMCart={addToCart,getCart,saveCart};

document.querySelectorAll('[data-buy-now]').forEach(btn => btn.addEventListener('click', () => {
  const qtyInput = btn.closest('.product-actions')?.querySelector('.qty');
  addToCart(btn.dataset.buyNow, Math.max(1, Number(qtyInput?.value || 1)));
  window.location.href = 'cart.html';
}));
