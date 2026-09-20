const SUPABASE_URL="https://naajrbseyanokuxcqqvn.supabase.co";
const SUPABASE_KEY="sb_publishable_Az9z2B58wLqIj5-Q3SztBg_lBQKIc2i";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s);

function msg(id,text){const el=$(id);if(el)el.textContent=text;}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function news(){
  const {data,error}=await db.from("news").select("id,title,body,published_at").order("published_at",{ascending:false});
  if(error)return;
  $("#newsGrid").innerHTML=(data||[]).map(x=>`<article class="card"><p class="eyebrow">${new Date(x.published_at).toLocaleDateString()}</p><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join("")||"<p>No news published yet.</p>";
}

function usernameFromAdmno(admno){return `${String(admno).trim()}@makuenigirls.sc.ke`.toLowerCase();}

async function loadStudent(){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return;
  const {data:student}=await db.from("students").select("*").eq("id",user.id).single();
  if(!student)return;
  $("#portal").classList.remove("hidden");
  $("#welcome").textContent=`Welcome, ${student.full_name} (${user.email})`;
  await loadSubs(student.id);
}

async function loadSubs(studentId){
  const {data,error}=await db.from("submissions").select("id,subject,title,original_filename,submitted_at,storage_path").eq("student_id",studentId).order("submitted_at",{ascending:false});
  if(error){msg("#subMsg",error.message);return;}
  $("#submissionList").innerHTML=(data||[]).map(x=>`<div class="submission"><b>${esc(x.subject)}</b> — ${esc(x.title)}<br><small>${esc(x.original_filename)} • ${new Date(x.submitted_at).toLocaleString()}</small><br><button class="btn downloadWork" data-path="${esc(x.storage_path)}">Download</button></div>`).join("")||"<p>No submissions yet.</p>";
  document.querySelectorAll(".downloadWork").forEach(b=>b.onclick=async()=>{
    const {data,error}=await db.storage.from("student-work").createSignedUrl(b.dataset.path,300);
    if(error)return alert(error.message);
    window.open(data.signedUrl,"_blank");
  });
}

$("#registerForm").onsubmit=async e=>{
  e.preventDefault();
  const f=Object.fromEntries(new FormData(e.target));
  const username=usernameFromAdmno(f.admno);
  const {data,error}=await db.auth.signUp({email:username,password:f.password,data:{full_name:f.name,admission_number:String(f.admno).trim(),contact_email:f.email||null,phone:f.phone||null,class_name:f.className||null}});
  if(error){msg("#regMsg",error.message);return;}
  if(!data.user){msg("#regMsg","Registration started. Check your email to confirm the account.");return;}
  msg("#regMsg",data.session ? `Account created. Username: ${username}` : `Account created. Username: ${username}. Check the registered email for the confirmation link before logging in.`);
  e.target.reset();
};

$("#loginForm").onsubmit=async e=>{
  e.preventDefault();
  const f=Object.fromEntries(new FormData(e.target));
  const username=String(f.username).trim().toLowerCase();
  const {data,error}=await db.auth.signInWithPassword({email:username,password:f.password});
  if(error){msg("#loginMsg",error.message);return;}
  msg("#loginMsg","Login successful.");
  await loadStudent();
};

$("#submissionForm").onsubmit=async e=>{
  e.preventDefault();
  const {data:{user}}=await db.auth.getUser();
  if(!user){msg("#subMsg","Please log in first.");return;}
  const f=new FormData(e.target);
  const file=f.get("work");
  if(!file||!file.name){msg("#subMsg","Select a file.");return;}
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  const path=`${user.id}/${Date.now()}-${safe}`;
  const up=await db.storage.from("student-work").upload(path,file,{upsert:false});
  if(up.error){msg("#subMsg",up.error.message);return;}
  const ins=await db.from("submissions").insert({student_id:user.id,subject:f.get("subject"),title:f.get("title"),original_filename:file.name,storage_path:path});
  if(ins.error){await db.storage.from("student-work").remove([path]);msg("#subMsg",ins.error.message);return;}
  msg("#subMsg","Work submitted successfully.");
  e.target.reset();
  await loadSubs(user.id);
};

$("#logout").onclick=async()=>{await db.auth.signOut();location.reload();};

$("#teacherLoginForm").onsubmit=e=>{e.preventDefault();msg("#teacherLoginMsg","Teacher administration remains on the secure server portal and will be connected in the hosting step.");};

news();
loadStudent();
