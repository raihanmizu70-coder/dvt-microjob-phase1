fetch("https://YOUR-RENDER.onrender.com/tasks")
.then(r=>r.json())
.then(data=>{
 document.getElementById("tasks").innerHTML =
 data.map(t=>`
  <div>
    <h4>${t.title}</h4>
    <p>${t.instructions}</p>
    <a href="${t.link}" target="_blank">Open</a>
    <button onclick="submit(${t.id})">Submit</button>
  </div>
 `).join("");
});

function submit(id){
 fetch("https://YOUR-RENDER.onrender.com/submit",{
  method:"POST",
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    telegram_id:123456,
    task_id:id,
    screenshot:"IMAGE_URL"
  })
 })
 alert("Submitted");
}
