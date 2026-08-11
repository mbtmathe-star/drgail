const CART_KEY='ggm-coaching-cart-v2';
let memoryCart=[];
const products={
  rewire:{id:'rewire',title:'Rewire Your Mind in 21 Days',image:'assets/book-rewire.png',price:170},
  teens:{id:'teens',title:'Mind Power 4 Teens Journal',image:'assets/book-mind-power.png',price:110},
  blitz:{id:'blitz',title:'Blitz Session',image:'assets/dr-gail-panel.jpeg',price:400,unit:'hour'}
};
const COMBO_PRICE=260;
const SNAPSCAN_CODE=''; // set once the real SnapCode is supplied
function snapscanAmount(cart){
  let subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const rewireQty=cart.find(i=>i.id==='rewire')?.qty||0;
  const teensQty=cart.find(i=>i.id==='teens')?.qty||0;
  const comboPairs=Math.min(rewireQty,teensQty);
  if(comboPairs>0){
    const rawPairPrice=products.rewire.price+products.teens.price;
    subtotal-=comboPairs*(rawPairPrice-COMBO_PRICE);
  }
  return subtotal;
}
function populateSnapScan(){
  const card=document.getElementById('snapscan-pay-card');
  if(!card)return;
  const cart=getCart();
  if(!SNAPSCAN_CODE||!cart.length){card.hidden=true;return}
  const amount=snapscanAmount(cart);
  const ref=`GGM-${Date.now().toString(36).toUpperCase()}`;
  document.getElementById('snapscan-amount').textContent=`R${amount}`;
  document.getElementById('snapscan-pay-link').href=`https://pos.snapscan.io/qr/${SNAPSCAN_CODE}?id=${encodeURIComponent(ref)}&amount=${amount*100}&strict=true`;
  card.hidden=false;
}
function getCart(){try{const stored=JSON.parse(localStorage.getItem(CART_KEY))||[];memoryCart=stored;return stored}catch{return memoryCart}}
function saveCart(cart){memoryCart=cart;try{localStorage.setItem(CART_KEY,JSON.stringify(cart))}catch{}updateCount()}
function updateCount(){const count=getCart().reduce((s,i)=>s+i.qty,0);document.querySelectorAll('.cart-count').forEach(el=>el.textContent=count)}
function addToCart(id,qty=1){const cart=getCart();const existing=cart.find(i=>i.id===id);if(existing)existing.qty+=qty;else cart.push({...products[id],qty});saveCart(cart);showToast(`${products[id].title} added to cart`)}
function showToast(text){let toast=document.querySelector('.cart-toast');if(!toast){toast=document.createElement('div');toast.className='cart-toast';toast.style.cssText='position:fixed;right:22px;bottom:22px;background:#250d35;color:white;padding:16px 20px;z-index:9999;box-shadow:0 15px 40px rgba(0,0,0,.3);font:600 12px Montserrat,Arial;letter-spacing:.06em';document.body.appendChild(toast)}toast.textContent=text;toast.hidden=false;setTimeout(()=>toast.hidden=true,2600)}
document.querySelectorAll('[data-add-cart]').forEach(btn=>btn.addEventListener('click',()=>{const qtyInput=btn.closest('.product-actions')?.querySelector('.qty');addToCart(btn.dataset.addCart,Math.max(1,Number(qtyInput?.value||1)))}));
function renderCart(){const wrap=document.querySelector('[data-cart-items]');if(!wrap)return;const cart=getCart();if(!cart.length){wrap.innerHTML='<div class="empty-cart">Your cart is currently empty.<br><a class="btn btn-primary" href="books.html" style="margin-top:25px">Browse Books</a></div>';return}
wrap.innerHTML=cart.map((item,index)=>`<div class="cart-item"><img src="${item.image}" alt="${item.title}"><div><h3>${item.title}</h3><small>R${item.price} × ${item.qty}${item.unit?` ${item.unit}${item.qty>1?'s':''}`:''} = R${item.price*item.qty}</small></div><input aria-label="${item.unit?'Hours':'Quantity'} for ${item.title}" type="number" min="1" value="${item.qty}" data-qty="${index}"><button class="remove-item" aria-label="Remove ${item.title}" data-remove="${index}">×</button></div>`).join('');
wrap.querySelectorAll('[data-qty]').forEach(input=>input.addEventListener('change',()=>{const c=getCart();c[Number(input.dataset.qty)].qty=Math.max(1,Number(input.value));saveCart(c);renderCart()}));
wrap.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{const c=getCart();c.splice(Number(btn.dataset.remove),1);saveCart(c);renderCart()}));
const summary=document.querySelector('[data-cart-summary]');if(!summary)return;
const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
const hasCombo=cart.some(i=>i.id==='rewire')&&cart.some(i=>i.id==='teens');
const hasPhysical=cart.some(i=>!products[i.id]?.unit);
const hasService=cart.some(i=>products[i.id]?.unit);
const deliveryBlock=hasPhysical?`<div class="cart-delivery"><strong>📦 Delivery (via PAXI):</strong><br>R59.95 (7–9 business days)<br>R109.95 (3–5 business days)<br><strong>🚚 Kimberley, Northern Cape:</strong> Free collection or R170 local delivery</div>`:'';
const serviceNote=hasService?`<p class="cart-delivery">GGM Coaching will contact you to schedule your Blitz Session once payment is arranged.</p>`:'';
summary.innerHTML=`<p><strong>${cart.reduce((s,i)=>s+i.qty,0)}</strong> item(s)</p><p class="cart-subtotal">Subtotal: <strong>R${subtotal}</strong>${hasPhysical?' <span>(excludes delivery)</span>':''}</p>${hasCombo?`<p class="cart-combo-note">Buying the Book + Journal together? The combo price is <strong>R${COMBO_PRICE}</strong> (excludes delivery) — GGM Coaching will adjust your total.</p>`:''}${deliveryBlock}${serviceNote}<p class="form-note">Final pricing${hasPhysical?', delivery fee':''} and payment method will be confirmed directly by GGM Coaching before payment.</p>`;
}
function populateCheckout(){const field=document.querySelector('[name="Order summary"]');if(field){const cart=getCart();field.value=cart.map(i=>`${i.qty} × ${i.title}`).join('\n')||'No items in cart';}
const deliveryFields=document.querySelectorAll('[data-delivery-field]');if(deliveryFields.length){const cart=getCart();const hasPhysical=cart.some(i=>!products[i.id]?.unit);const hide=cart.length>0&&!hasPhysical;deliveryFields.forEach(f=>{f.hidden=hide;});}}
updateCount();renderCart();populateCheckout();populateSnapScan();
window.GGMCart={addToCart,getCart,saveCart};

document.querySelectorAll('[data-buy-now]').forEach(btn => btn.addEventListener('click', () => {
  const qtyInput = btn.closest('.product-actions')?.querySelector('.qty');
  addToCart(btn.dataset.buyNow, Math.max(1, Number(qtyInput?.value || 1)));
  window.location.href = 'cart.html';
}));

document.querySelectorAll('[data-add-combo]').forEach(btn => btn.addEventListener('click', () => {
  addToCart('rewire', 1);
  addToCart('teens', 1);
  showToast(`Combo added to cart — R${COMBO_PRICE} (excludes delivery)`);
}));
