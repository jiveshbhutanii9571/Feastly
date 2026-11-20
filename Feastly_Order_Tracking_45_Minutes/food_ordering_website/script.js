const foods = [
 {id:1,image:"assets/burger.png",name:"Classic Cheeseburger",category:"Burger",price:199,emoji:"🍔",rating:4.8,badge:"BESTSELLER",desc:"Juicy patty, melted cheese and our special sauce.",bg:"#34241d"},
 {id:2,image:"assets/burger.png",name:"Double Smash Burger",category:"Burger",price:279,emoji:"🍔",rating:4.9,badge:"POPULAR",desc:"Double patty with melted cheese and caramelised relish.",bg:"#3c261e"},
 {id:3,image:"assets/pizza.png",name:"Margherita Pizza",category:"Pizza",price:249,emoji:"🍕",rating:4.7,badge:"VEG",desc:"Classic tomato, mozzarella and fresh basil.",bg:"#3a2c1d"},
 {id:4,image:"assets/pizza.png",name:"Farmhouse Pizza",category:"Pizza",price:329,emoji:"🍕",rating:4.8,badge:"VEG",desc:"Loaded with capsicum, onion, corn and olives.",bg:"#35231b"},
 {id:5,image:"assets/paneer-butter-masala.png",name:"Paneer Butter Masala",category:"Indian",price:259,emoji:"🍛",rating:4.9,badge:"CHEF'S PICK",desc:"Creamy tomato gravy with soft paneer cubes.",bg:"#3a251c"},
 {id:6,image:"assets/paneer-biryani.png",name:"Veg Biryani",category:"Indian",price:219,emoji:"🍚",rating:4.6,badge:"POPULAR",desc:"Fragrant basmati rice, spices and vegetables.",bg:"#3a2d1c"},
 {id:7,image:"assets/paneer-masala-dosa.png",name:"Butter Paneer Dosa",category:"Indian",price:199,emoji:"🥞",rating:4.9,badge:"CHEF'S SPECIAL",desc:"Crispy dosa stuffed with buttery paneer masala, served with chutneys and sambar.",bg:"#35291d"},
 {id:8,image:"assets/coffee.png",name:"Cold Coffee",category:"Drinks",price:119,emoji:"🥤",rating:4.6,badge:"CHILLED",desc:"Creamy iced coffee for a refreshing break.",bg:"#1d302a"},
 {id:9,image:"assets/lime-soda.png",name:"Fresh Lime Soda",category:"Drinks",price:79,emoji:"🍋",rating:4.5,badge:"REFRESHING",desc:"Fresh lime, fizz and just the right sweetness.",bg:"#29331e"},
 {id:10,image:"assets/fries.png",name:"Loaded French Fries",category:"Burger",price:129,emoji:"🍟",rating:4.7,badge:"CRISPY",desc:"Golden fries with seasoning and a dip.",bg:"#3b2d1a"},
 {id:11,image:"assets/brownie.png",name:"Chocolate Brownie",category:"Dessert",price:149,emoji:"🍫",rating:4.8,badge:"SWEET TREAT",desc:"Rich chocolate brownie for your sweet tooth.",bg:"#33221d"},
 {id:12,image:"assets/chole-bhature.png",name:"Chole Bhature",category:"Indian",price:179,emoji:"🫓",rating:4.8,badge:"FAVOURITE",desc:"Spiced chickpeas with fluffy bhature.",bg:"#35271c"},
 {id:13,image:"assets/pasta.png",name:"Creamy Fettuccine Alfredo",category:"Pasta",price:299,emoji:"🍝",rating:4.9,badge:"NEW",desc:"Silky parmesan cream sauce, herbs and tender pasta.",bg:"#342a20"},
 {id:14,image:"assets/lava-cake.png",name:"Molten Lava Cake",category:"Dessert",price:189,emoji:"🍰",rating:4.9,badge:"MUST TRY",desc:"Warm chocolate centre served with vanilla ice cream.",bg:"#38201d"},
 {id:15,image:"assets/tacos.png",name:"Sizzling Street Tacos",category:"Tacos",price:229,emoji:"🌮",rating:4.8,badge:"NEW",desc:"Street-style tacos with salsa, lime and fresh herbs.",bg:"#36271a"},
 {id:16,name:"Classic Chole Bhature",category:"Indian",price:189,emoji:"🫓",rating:4.8,badge:"NORTH INDIAN",desc:"Fluffy bhature with spicy chole, onions and pickle.",bg:"#35271c",image:"assets/chole-bhature.png"},
 {id:17,name:"Paneer Masala Dosa",category:"Indian",price:199,emoji:"🥞",rating:4.9,badge:"CHEF'S PICK",desc:"Crispy dosa stuffed with spiced paneer and potato, served with chutneys and sambar.",bg:"#35291d",image:"assets/paneer-masala-dosa.png"},
 {id:18,name:"Paneer Biryani",category:"Indian",price:249,emoji:"🍚",rating:4.8,badge:"POPULAR",desc:"Aromatic basmati rice with paneer, vegetables and Indian spices.",bg:"#3a2d1c",image:"assets/paneer-biryani.png"}
];
let cart = JSON.parse(localStorage.getItem("feastlyCart") || "{}");
let activeCategory = "All";
const grid = document.getElementById("foodGrid");
const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
function renderFoods(){
 const query = document.getElementById("searchInput").value.trim().toLowerCase();
 const shown = foods.filter(f => (activeCategory==="All" || f.category===activeCategory) && (f.name.toLowerCase().includes(query)||f.desc.toLowerCase().includes(query)));
 grid.innerHTML = shown.map(f=>`<article class="food-card"><div class="food-image" style="--food-bg:${f.bg}">${f.image ? `<img src="${f.image}" alt="${f.name}" loading="lazy">` : `<span class="food-emoji" aria-hidden="true">${f.emoji}</span>`}<span class="food-badge">${f.badge}</span></div><div class="food-info"><div class="food-title-row"><h3>${f.name}</h3><span class="rating">★ ${f.rating.toFixed(1)}</span></div><p class="food-desc">${f.desc}</p><div class="food-bottom"><span class="price">${money(f.price)}</span><button class="add-btn" data-add="${f.id}">+ ADD</button></div></div></article>`).join("");
 document.getElementById("noResults").hidden=shown.length!==0;
}
function totals(){
 const entries=Object.entries(cart).filter(([id,q])=>q>0);
 const subtotal=entries.reduce((s,[id,q])=>s+foods.find(f=>f.id===Number(id)).price*q,0);
 const delivery=subtotal===0?0:(subtotal>=499?0:30);
 const platform=subtotal===0?0:5;
 const gst=Math.round(subtotal*.05);
 return {entries,subtotal,delivery,platform,gst,total:subtotal+delivery+platform+gst};
}
function saveCart(){localStorage.setItem("feastlyCart",JSON.stringify(cart));renderCart();}
function renderCart(){
 const t=totals(), count=t.entries.reduce((s,[id,q])=>s+q,0);
 document.getElementById("cartCount").textContent=count;
 const items=document.getElementById("cartItems");
 items.innerHTML=t.entries.length?t.entries.map(([id,q])=>{const f=foods.find(x=>x.id===Number(id));return `<div class="cart-item"><div class="cart-item-emoji">${f.emoji}</div><div><h4>${f.name}</h4><small>${money(f.price)} each</small><div class="quantity"><button data-qty="${id}" data-delta="-1" aria-label="Decrease">−</button><span>${q}</span><button data-qty="${id}" data-delta="1" aria-label="Increase">+</button></div></div><div><strong>${money(f.price*q)}</strong><br><button class="remove-btn" data-remove="${id}">Remove</button></div></div>`}).join(""):'<div class="empty-cart">Your cart is waiting for something tasty 😋<br><small>Add a dish from the menu.</small></div>';
 document.getElementById("subtotal").textContent=money(t.subtotal);
 document.getElementById("deliveryFee").textContent=t.delivery===0&&t.subtotal>0?"FREE":money(t.delivery);
 document.getElementById("platformFee").textContent=money(t.platform);
 document.getElementById("gstFee").textContent=money(t.gst);
 document.getElementById("total").textContent=money(t.total);
}
function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();showToast("Added to cart! 😋")}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];saveCart()}
function showCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.add("show")}
function hideCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.remove("show")}
let toastTimer;
function showToast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400)}
function showOrderSuccess(orderId){const box=document.getElementById("orderSuccessDialog");document.getElementById("successOrderId").textContent=orderId;box.showModal();}
document.getElementById("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x===b));renderFoods()});
document.getElementById("searchInput").addEventListener("input",renderFoods);
document.getElementById("heroSearch").addEventListener("input",e=>{document.getElementById("searchInput").value=e.target.value;activeCategory="All";document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));renderFoods()});
document.getElementById("searchGo").addEventListener("click",()=>{document.getElementById("searchInput").value=document.getElementById("heroSearch").value;activeCategory="All";document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));renderFoods();document.getElementById("menu").scrollIntoView({behavior:"smooth"})});
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add))});
document.getElementById("cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(q)changeQty(Number(q.dataset.qty),Number(q.dataset.delta));if(r){delete cart[r.dataset.remove];saveCart()}});
document.getElementById("openCart").addEventListener("click",showCart);document.getElementById("closeCart").addEventListener("click",hideCart);document.getElementById("overlay").addEventListener("click",hideCart);
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideCart()});
document.getElementById("checkoutBtn").addEventListener("click",()=>{if(!Object.keys(cart).length){showToast("Your cart is empty — add a dish first.");return}hideCart();document.getElementById("checkoutDialog").showModal()});
document.getElementById("closeCheckout").addEventListener("click",()=>document.getElementById("checkoutDialog").close());
document.getElementById("checkoutForm").addEventListener("submit",async e=>{e.preventDefault();const name=document.getElementById("customerName").value.trim();const payload={name,phone:document.getElementById("customerPhone").value.trim(),address:document.getElementById("customerAddress").value.trim(),payment_method:document.getElementById("paymentMethod").value,instructions:document.getElementById("orderInstructions").value,items:totals().entries.map(([id,qty])=>({id:Number(id),quantity:qty}))};try{const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();if(!res.ok){if(res.status===401){document.getElementById("checkoutDialog").close();openAuth();showToast("Please login before placing an order.");return}throw new Error(data.error||"Could not place order")}document.getElementById("checkoutDialog").close();e.target.reset();document.getElementById("orderInstructions").value="";cart={};saveCart();showOrderSuccess(data.order_id)}catch(err){showToast(err.message==="Failed to fetch"?"Start the Feastly backend using python app.py first.":err.message)}});
document.getElementById("locationBtn").addEventListener("click",()=>document.getElementById("addressDialog").showModal());
document.getElementById("closeAddress").addEventListener("click",()=>document.getElementById("addressDialog").close());
document.getElementById("addressForm").addEventListener("submit",e=>{e.preventDefault();const a=document.getElementById("addressInput").value.trim();document.querySelector(".location-pill strong").textContent=a.length>22?a.slice(0,22)+"…":a;document.getElementById("addressDialog").close();showToast("Demo delivery address saved.")});
let authMode="login", currentUser=null;
function openAuth(){authMode=currentUser?"account":"login";updateAuthDialog();document.getElementById("authDialog").showModal()}
function updateAuthDialog(){const logged=!!currentUser;document.getElementById("authTitle").textContent=logged?"Your account":authMode==="register"?"Create account":"Login";document.getElementById("authNameWrap").hidden=authMode!=="register";document.getElementById("authName").required=authMode==="register";document.getElementById("authPassword").hidden=logged;document.querySelector('label[for="authPassword"]').hidden=logged;document.getElementById("authEmail").hidden=logged;document.querySelector('label[for="authEmail"]').hidden=logged;document.getElementById("authSubmit").hidden=logged;document.getElementById("authSwitch").hidden=logged;document.getElementById("logoutBtn").hidden=!logged;document.getElementById("authSwitch").textContent=authMode==="register"?"Already have an account? Login":"New here? Create an account";document.getElementById("authMessage").textContent=logged?`Logged in as ${currentUser.name} (${currentUser.email})`:""}
async function refreshUser(){try{const r=await fetch("/api/me");const d=await r.json();currentUser=d.user||null}catch(e){currentUser=null}document.getElementById("accountLabel").textContent=currentUser?"Account":"Login"}
document.getElementById("profileBtn").addEventListener("click",openAuth);
function orderTrackingMarkup(o){
 const elapsed=Math.max(0,(Date.now()-new Date(o.created_at).getTime())/60000);
 const cancelled=o.status==="Cancelled", delivered=!cancelled&&elapsed>=45;
 const stage=cancelled?-1:elapsed<5?0:elapsed<20?1:elapsed<45?2:3;
 const labels=["Order placed","Preparing","On the way","Delivered"];
 const icons=["✓","👨‍🍳","🛵","🏠"];
 const steps=labels.map((label,i)=>`<div class="progress-step ${!cancelled&&i<stage?'complete':i===stage?'active-step':''}"><span>${!cancelled&&i<stage?'✓':icons[i]}</span><b>${label}</b></div>`).join("");
 const remaining=Math.max(0,Math.ceil(45-elapsed));
 return `<section class="order-tracking"><div class="tracking-top"><div class="delivery-illustration">${cancelled?'✕':delivered?'🏠':'🛵'}</div><div class="tracking-copy"><span class="status-label">${cancelled?'ORDER CANCELLED':delivered?'DELIVERED (DEMO)':'LIVE ORDER TRACKING'}</span><h3>${cancelled?'This order was cancelled':delivered?'Your order journey is complete!':labels[stage]}</h3><p>${cancelled?'No further delivery updates are available.':delivered?'Estimated 45-minute delivery window completed.':`Your food is being tracked through a ${45}-minute demo delivery window.`}</p></div><div class="eta"><strong>${cancelled?'—':delivered?'Done':remaining+' min'}</strong><span>${delivered?'ETA complete':'Estimated time'}</span></div></div><div class="progress-track">${steps}</div>${!cancelled&&!delivered?'<p class="tracking-disclaimer">Demo tracking: stages update automatically based on time since order placement.</p>':''}</section>`;
}
async function loadMyOrders(){
 const dialog=document.getElementById("ordersDialog"), list=document.getElementById("ordersList");
 if(!currentUser){dialog.close();openAuth();showToast("Please login to view your orders.");return;}
 list.innerHTML='<p class="muted">Loading your orders…</p>';dialog.showModal();
 try{const r=await fetch("/api/orders");const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load orders.");
 if(!d.orders.length){list.innerHTML='<div class="orders-empty">🍽️<h3>No orders yet</h3><p>Your placed orders will appear here.</p></div>';return;}
 list.innerHTML=d.orders.map(o=>{
  const itemLines=o.items.map(i=>"<span>"+i.name+" × "+i.quantity+"</span>").join("");
  const elapsed=(Date.now()-new Date(o.created_at).getTime())/60000;
  const canCancel=o.status!=="Cancelled"&&elapsed<45;
  const action=canCancel?'<button class="cancel-order-btn" data-cancel-order="'+Number(o.order_id.replace("FST",""))+'">Cancel order</button>':'<span class="cancelled-note">'+(o.status==="Cancelled"?'Order cancelled':'Delivery window completed')+'</span>';
  return '<article class="order-card"><button class="order-open" type="button" data-open-order="'+Number(o.order_id.replace("FST",""))+'"><div class="order-card-top"><div><strong>'+o.order_id+'</strong><small>'+new Date(o.created_at).toLocaleString("en-IN")+'</small></div><span class="order-status '+(o.status==="Cancelled"?"cancelled":"placed")+'">'+(o.status||"Placed")+'</span></div><div class="order-lines">'+itemLines+'</div><div class="order-card-bottom"><strong>'+money(o.total)+'</strong><span class="view-tracking">View tracking ↗</span></div></button><div class="tracking-slot" id="tracking-'+Number(o.order_id.replace("FST",""))+'" hidden>'+orderTrackingMarkup(o)+'</div><div class="order-actions">'+action+'</div></article>';
 }).join("");
 }catch(err){list.innerHTML=`<p class="auth-message">${err.message}</p>`;}
}
document.getElementById("myOrdersBtn").addEventListener("click",loadMyOrders);
document.getElementById("closeOrders").addEventListener("click",()=>document.getElementById("ordersDialog").close());
document.getElementById("ordersList").addEventListener("click",async e=>{
 const open=e.target.closest("[data-open-order]");
 if(open){const slot=document.getElementById("tracking-"+open.dataset.openOrder);slot.hidden=!slot.hidden;open.querySelector(".view-tracking").textContent=slot.hidden?"View tracking ↗":"Hide tracking ↑";return;}
 const b=e.target.closest("[data-cancel-order]");if(!b)return;
 if(!confirm("Are you sure you want to cancel this order?"))return;b.disabled=true;
 try{const r=await fetch(`/api/orders/${b.dataset.cancelOrder}/cancel`,{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not cancel order.");showToast(d.message||"Order cancelled successfully.");loadMyOrders();}
 catch(err){showToast(err.message);b.disabled=false;}
});
document.getElementById("closeAuth").addEventListener("click",()=>document.getElementById("authDialog").close());
document.getElementById("authSwitch").addEventListener("click",()=>{authMode=authMode==="register"?"login":"register";document.getElementById("authMessage").textContent="";updateAuthDialog()});
document.getElementById("authForm").addEventListener("submit",async e=>{e.preventDefault();if(currentUser)return;const payload={email:document.getElementById("authEmail").value.trim(),password:document.getElementById("authPassword").value};if(authMode==="register")payload.name=document.getElementById("authName").value.trim();const endpoint=authMode==="register"?"/api/register":"/api/login";const msg=document.getElementById("authMessage");msg.textContent="Please wait…";try{const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Authentication failed");currentUser=d.user;document.getElementById("accountLabel").textContent="Account";updateAuthDialog();showToast(authMode==="register"?"Account created successfully!":"Login successful!")}catch(err){msg.textContent=err.message==="Failed to fetch"?"Backend is not running. Start it with python app.py.":err.message}});
document.getElementById("logoutBtn").addEventListener("click",async()=>{try{await fetch("/api/logout",{method:"POST"});currentUser=null;document.getElementById("accountLabel").textContent="Login";document.getElementById("authDialog").close();showToast("You have logged out.")}catch(e){document.getElementById("authMessage").textContent="Could not log out. Is the backend running?"}});

document.getElementById("successClose").addEventListener("click",()=>document.getElementById("orderSuccessDialog").close());
document.getElementById("successViewOrders").addEventListener("click",()=>{document.getElementById("orderSuccessDialog").close();loadMyOrders();});
document.getElementById("year").textContent=new Date().getFullYear();
renderFoods();renderCart();refreshUser();
