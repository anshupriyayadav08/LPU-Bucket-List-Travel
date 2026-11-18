const destinations = [
  {id:"paris",name:"Paris",country:"France",category:"City",cost:85000,description:"Art-filled streets, little cafés, and the magic of the Eiffel Tower.",image:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80"},
  {id:"bali",name:"Bali",country:"Indonesia",category:"Beach",cost:55000,description:"Tropical shores, emerald rice terraces, and peaceful temples.",image:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80"},
  {id:"swiss-alps",name:"Swiss Alps",country:"Switzerland",category:"Nature",cost:150000,description:"Snow-capped peaks, scenic trains, and storybook mountain towns.",image:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80"},
  {id:"kyoto",name:"Kyoto",country:"Japan",category:"Culture",cost:120000,description:"Cherry blossoms, traditional lanes, gardens, and timeless rituals.",image:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80"},
  {id:"santorini",name:"Santorini",country:"Greece",category:"Beach",cost:135000,description:"Whitewashed villages, blue domes, and glowing sunset views.",image:"https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=900&q=80"},
  {id:"patagonia",name:"Patagonia",country:"Argentina & Chile",category:"Nature",cost:180000,description:"Wild landscapes, turquoise lakes, glaciers, and epic hiking trails.",image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"}
];

const defaultMilestones = [
  {id:1,text:"Choose my dream destination",done:true},
  {id:2,text:"Research travel dates and visa requirements",done:false},
  {id:3,text:"Create a realistic travel budget",done:false},
  {id:4,text:"Save money for the trip",done:false},
  {id:5,text:"Book flights and accommodation",done:false},
  {id:6,text:"Take the trip and make memories!",done:false}
];

const STORAGE_KEY = "wanderlustTravelPlanner_v1";
let state = loadState();
let activeFilter = "All";
let searchTerm = "";

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved) return {
      bucket: Array.isArray(saved.bucket) ? saved.bucket : [],
      milestones: Array.isArray(saved.milestones) ? saved.milestones : defaultMilestones,
      tripCost: Number(saved.tripCost ?? 50000),
      amountSaved: Number(saved.amountSaved ?? 10000)
    };
  }catch(error){ console.warn("Saved travel data could not be loaded.", error); }
  return {bucket:[],milestones:defaultMilestones.map(item=>({...item})),tripCost:50000,amountSaved:10000};
}
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function money(value){ return "₹" + Math.max(0,Number(value)||0).toLocaleString("en-IN"); }
function getDestination(id){ return destinations.find(item=>item.id===id); }
function showToast(message){
  const toast=document.getElementById("toast");
  toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2300);
}

function renderDestinations(){
  const grid=document.getElementById("destinationGrid");
  const filtered=destinations.filter(item=>(activeFilter==="All"||item.category===activeFilter)&&
    (item.name+" "+item.country+" "+item.category).toLowerCase().includes(searchTerm.toLowerCase()));
  if(!filtered.length){grid.innerHTML='<div class="empty-state">No destinations found. Try a different search.</div>';return;}
  grid.innerHTML=filtered.map(item=>{
    const saved=state.bucket.some(entry=>entry.id===item.id);
    return `<article class="destination-card">
      <div class="card-image" style="background-image:url('${item.image}')">
        <span class="category-tag">${item.category.toUpperCase()}</span>
        <button class="heart-button ${saved?"saved":""}" data-add="${item.id}" aria-label="${saved?"Remove":"Add"} ${item.name} ${saved?"from":"to"} bucket list">${saved?"♥":"♡"}</button>
      </div>
      <div class="card-body">
        <div class="card-location">⌖ &nbsp;${item.country}</div>
        <div class="card-title-row"><h3>${item.name}</h3></div>
        <p class="card-description">${item.description}</p>
        <div class="card-footer"><div class="budget-estimate"><small>ESTIMATED TRIP BUDGET</small><strong>${money(item.cost)}</strong></div>
          <button class="add-button ${saved?"added":""}" data-add="${item.id}">${saved?"✓ Added to list":"＋ Add to bucket list"}</button></div>
      </div>
    </article>`;
  }).join("");
}
function toggleBucket(id){
  const index=state.bucket.findIndex(item=>item.id===id);
  if(index>=0){state.bucket.splice(index,1);showToast("Removed from your bucket list.");}
  else{const dest=getDestination(id);if(dest){state.bucket.push({id:dest.id,status:"Want to go"});showToast(dest.name+" added to your bucket list!");}}
  saveState();renderAll();
}
function renderBucket(){
  const holder=document.getElementById("bucketListContent");
  document.getElementById("bucketCount").textContent=`${state.bucket.length} ${state.bucket.length===1?"place":"places"}`;
  if(!state.bucket.length){holder.innerHTML='<div class="empty-state">Your list is waiting for its first adventure. Add a destination above to get started! ✈</div>';return;}
  holder.innerHTML=state.bucket.map(entry=>{
    const dest=getDestination(entry.id);if(!dest)return "";
    return `<div class="bucket-row">
      <div class="bucket-thumb" style="background-image:url('${dest.image}')"></div>
      <div><h4>${dest.name}</h4><p>${dest.country} · Budget: ${money(dest.cost)}</p></div>
      <select class="status-select" data-status="${dest.id}" aria-label="Travel status for ${dest.name}">
        ${["Want to go","Planning","Completed"].map(status=>`<option ${entry.status===status?"selected":""}>${status}</option>`).join("")}
      </select>
      <button class="remove-button" data-remove="${dest.id}" aria-label="Remove ${dest.name}">Remove ×</button>
    </div>`;
  }).join("");
}
function renderMilestones(){
  const holder=document.getElementById("milestoneList");
  holder.innerHTML=state.milestones.map(item=>`<div class="milestone-item ${item.done?"done":""}">
    <input class="milestone-check" type="checkbox" id="milestone-${item.id}" data-check="${item.id}" ${item.done?"checked":""}>
    <label for="milestone-${item.id}">${escapeHtml(item.text)}</label>
    <button class="delete-milestone" data-delete-milestone="${item.id}" aria-label="Delete milestone">×</button>
  </div>`).join("");
  const completed=state.milestones.filter(item=>item.done).length;
  const percent=state.milestones.length?Math.round(completed/state.milestones.length*100):0;
  document.getElementById("overallProgressLabel").textContent=percent+"%";
  document.getElementById("overallProgressBar").style.width=percent+"%";
  document.getElementById("milestoneSummary").textContent=state.milestones.length?`${completed} of ${state.milestones.length} milestones completed. Keep moving toward your dream!`:"Add a milestone to start tracking your journey.";
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function renderBudget(){
  const cost=Math.max(0,Number(state.tripCost)||0),saved=Math.max(0,Number(state.amountSaved)||0);
  const percent=cost?Math.min(100,Math.round(saved/cost*100)):(saved?100:0);
  document.getElementById("tripCost").value=state.tripCost;
  document.getElementById("amountSaved").value=state.amountSaved;
  document.getElementById("savingsPercent").textContent=percent+"%";
  document.getElementById("savingsBar").style.width=percent+"%";
  document.getElementById("savedText").textContent=money(saved)+" saved";
  document.getElementById("remainingText").textContent=saved>=cost?"Goal reached! 🎉":money(cost-saved)+" to go";
}
function renderStats(){
  document.getElementById("statDreams").textContent=state.bucket.length;
  document.getElementById("statCompleted").textContent=state.bucket.filter(item=>item.status==="Completed").length;
  const completed=state.milestones.filter(item=>item.done).length;
  document.getElementById("statProgress").textContent=(state.milestones.length?Math.round(completed/state.milestones.length*100):0)+"%";
}
function renderAll(){renderDestinations();renderBucket();renderMilestones();renderBudget();renderStats();}

document.getElementById("filters").addEventListener("click",event=>{
  const button=event.target.closest("[data-filter]");if(!button)return;
  activeFilter=button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item=>item.classList.toggle("active",item===button));
  renderDestinations();
});
document.getElementById("destinationSearch").addEventListener("input",event=>{searchTerm=event.target.value;renderDestinations();});
document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");if(add){toggleBucket(add.dataset.add);return;}
  const remove=event.target.closest("[data-remove]");if(remove){toggleBucket(remove.dataset.remove);return;}
  const del=event.target.closest("[data-delete-milestone]");
  if(del){state.milestones=state.milestones.filter(item=>item.id!==Number(del.dataset.deleteMilestone));saveState();renderAll();showToast("Milestone removed.");}
});
document.getElementById("bucketListContent").addEventListener("change",event=>{
  const select=event.target.closest("[data-status]");if(!select)return;
  const entry=state.bucket.find(item=>item.id===select.dataset.status);if(entry)entry.status=select.value;
  saveState();renderAll();showToast("Travel status updated!");
});
document.getElementById("milestoneList").addEventListener("change",event=>{
  const checkbox=event.target.closest("[data-check]");if(!checkbox)return;
  const item=state.milestones.find(item=>item.id===Number(checkbox.dataset.check));if(item)item.done=checkbox.checked;
  saveState();renderAll();
});
document.getElementById("milestoneForm").addEventListener("submit",event=>{
  event.preventDefault();const input=document.getElementById("milestoneInput");const value=input.value.trim();if(!value)return;
  state.milestones.push({id:Date.now(),text:value,done:false});input.value="";saveState();renderAll();showToast("New milestone added!");
});
["tripCost","amountSaved"].forEach(id=>document.getElementById(id).addEventListener("input",event=>{
  state[id]=Math.max(0,Number(event.target.value)||0);saveState();renderBudget();
}));
const menuToggle=document.getElementById("menuToggle");
menuToggle.addEventListener("click",()=>{
  const nav=document.getElementById("navLinks");const open=nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));menuToggle.textContent=open?"×":"☰";
});
document.querySelectorAll("#navLinks a").forEach(link=>link.addEventListener("click",()=>{
  document.getElementById("navLinks").classList.remove("open");menuToggle.setAttribute("aria-expanded","false");menuToggle.textContent="☰";
}));
renderAll();
