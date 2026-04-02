"use client";
// app/student/profile/ProfilePage.tsx
import { useState } from "react";
import "../styles/profile.css";
import { Edit2, Save, Shield, Star, MapPin, Phone, Mail, BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { AVATARS, AVATAR_CATEGORIES, getAvatar } from "../constants/avatars";

const INTEREST_EMOJIS: Record<string,string> = {
  Drawing:"🎨", Science:"🔬", Music:"🎵", Reading:"📚",
  Sports:"⚽", Cooking:"🍳", Dancing:"💃", Writing:"✍️",
  Nature:"🌿", Crafts:"✂️", Singing:"🎤", Gardening:"🌱",
};

interface Profile {
  name:string; dob:string; email:string; phone:string;
  address:string; classInfo:string; interests:string[];
  bio:string; ecName:string; ecPhone:string; ecRelation:string; showEC:boolean;
}

export default function ProfilePage() {
  const { avatarId, setAvatarId, setName: setCtxName } = useProfile();
  const av = getAvatar(avatarId);

  const [editing, setEditing]       = useState(false);
  const [saved, setSaved]           = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeCategory, setActiveCat] = useState<string>("Animals");
  const [tagInput, setTagInput]     = useState("");

  const [profile, setProfile] = useState<Profile>({
    name:"Aisha Sharma", dob:"2010-05-14",
    email:"aisha.sharma@bwf.edu", phone:"+91 9876543210",
    address:"Srinagar, Jammu & Kashmir, India",
    classInfo:"10th Grade", interests:["Drawing","Science","Music"],
    bio:"I love learning new things and believe every day is a chance to grow. 🌸",
    ecName:"", ecPhone:"", ecRelation:"", showEC:false,
  });

  const set = (k:keyof Profile, v:any) => setProfile(p=>({...p,[k]:v}));

  const handleSave = () => {
    setCtxName(profile.name);   // sync name to context
    setSaved(true); setEditing(false); setPickerOpen(false);
    setTimeout(()=>setSaved(false), 2800);
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (v && !profile.interests.includes(v)) { set("interests",[...profile.interests,v]); setTagInput(""); }
  };

  const catAvatars = AVATARS.filter(a => a.category === activeCategory);

  return (
    <div className="prof-page">

      {/* HEADER */}
      <header className="prof-header">
        <div>
          <p className="prof-eyebrow">My Account</p>
          <h1 className="prof-title">My Profile</h1>
        </div>
        <div className="prof-header-right">
          {saved && <div className="prof-toast"><Sparkles size={13}/> Saved! ✨</div>}
          <button
            className={`prof-edit-btn${editing?" prof-edit-btn--save":""}`}
            onClick={()=>editing?handleSave():setEditing(true)}
          >
            {editing?<><Save size={15}/>Save Profile</>:<><Edit2 size={15}/>Edit Profile</>}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="prof-hero">
        <div className="prof-blob b1"/><div className="prof-blob b2"/><div className="prof-blob b3"/>

        {/* Avatar */}
        <div className="prof-av-col">
          <button
            className="prof-av"
            style={{background:av.bg}}
            onClick={()=>editing&&setPickerOpen(o=>!o)}
            title={editing?"Tap to change avatar":av.label}
          >
            <span className="prof-av-emoji">{av.emoji}</span>
            {editing&&<span className="prof-av-overlay">🎨</span>}
          </button>
          <span className="prof-av-name">{av.label}</span>
        </div>

        {/* Info */}
        <div className="prof-hero-info">
          {editing
            ?<input className="prof-name-input" value={profile.name} onChange={e=>set("name",e.target.value)}/>
            :<h2 className="prof-hero-name">{profile.name}</h2>}

          <div className="prof-badges">
            <span className="prof-badge prof-badge--b"><Star size={11} fill="currentColor"/>Student</span>
            <span className="prof-badge prof-badge--t"><BookOpen size={11}/>{profile.classInfo}</span>
          </div>

          {editing
            ?<input className="prof-bio-input" value={profile.bio} onChange={e=>set("bio",e.target.value)} placeholder="Something about yourself…"/>
            :<p className="prof-hero-bio">{profile.bio}</p>}

          <div className="prof-tags">
            {profile.interests.map(t=>(
              <span key={t} className="prof-tag">
                {INTEREST_EMOJIS[t]||"🌟"} {t}
                {editing&&<button className="prof-tag-rm" onClick={()=>set("interests",profile.interests.filter(x=>x!==t))}>×</button>}
              </span>
            ))}
            {editing&&(
              <input
                className="prof-tag-add"
                placeholder="+ Add…"
                value={tagInput}
                onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addTag();}}
              />
            )}
          </div>
        </div>
      </section>

      {/* AVATAR PICKER */}
      {pickerOpen&&editing&&(
        <section className="prof-picker">
          <div className="prof-picker-top">
            <div>
              <h3 className="prof-picker-title">Choose your avatar ✨</h3>
              <p className="prof-picker-sub">Pick something that feels like you!</p>
            </div>
            <button className="prof-picker-close" onClick={()=>setPickerOpen(false)}>✕</button>
          </div>

          {/* Category tabs */}
          <div className="prof-picker-tabs">
            {AVATAR_CATEGORIES.map(cat=>(
              <button
                key={cat}
                className={`prof-picker-tab${activeCategory===cat?" active":""}`}
                onClick={()=>setActiveCat(cat)}
              >{cat}</button>
            ))}
          </div>

          {/* Avatar grid */}
          <div className="prof-picker-grid">
            {catAvatars.map(a=>(
              <button
                key={a.id}
                className={`prof-picker-item${avatarId===a.id?" selected":""}`}
                style={{background:a.bg}}
                onClick={()=>{setAvatarId(a.id);setPickerOpen(false);}}
                title={a.label}
              >
                <span className="picker-emoji">{a.emoji}</span>
                <span className="picker-label">{a.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      <div className="prof-stats">
        {[
          {emoji:"📅",label:"Born",     value:new Date(profile.dob).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})},
          {emoji:"🏫",label:"Class",    value:profile.classInfo},
          {emoji:"🎯",label:"Interests",value:`${profile.interests.length} things I love`},
        ].map((s,i)=>(
          <div key={i} className="prof-stat">
            <span className="prof-stat-emoji">{s.emoji}</span>
            <div>
              <p className="prof-stat-label">{s.label}</p>
              <p className="prof-stat-val">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="prof-grid">

        {/* Personal Info */}
        <div className="prof-card prof-card--wide">
          <div className="prof-card-hd"><span>👤</span><h2>Personal Information</h2></div>
          <div className="prof-fields">
            <PField label="✉️ Email"   editing={editing} value={profile.email}   onChange={v=>set("email",v)}   type="email"/>
            <PField label="📞 Phone"   editing={editing} value={profile.phone}   onChange={v=>set("phone",v)}   type="tel"/>
            <PField label="📍 Address" editing={editing} value={profile.address} onChange={v=>set("address",v)} full/>
          </div>
        </div>

        {/* Trusted Person — sensitive, optional, non-family language */}
        <div className={`prof-card prof-card--green${profile.showEC?" prof-card--green-open":""}`}>
          <button className="prof-ec-toggle" onClick={()=>set("showEC",!profile.showEC)}>
            <div className="prof-card-hd" style={{marginBottom:0}}>
              <span>🌿</span>
              <h2>Trusted Person</h2>
              <span className="prof-optional">optional</span>
            </div>
            {profile.showEC?<ChevronUp size={15}/>:<ChevronDown size={15}/>}
          </button>
          <p className="prof-ec-note">
            If you'd like, you can add someone you trust — a teacher, a community elder, a neighbour — anyone who makes you feel safe. This is completely up to you. 💚
          </p>
          {profile.showEC&&(
            <div className="prof-fields">
              <PField label="Their name"        editing={editing} value={profile.ecName}     onChange={v=>set("ecName",v)}     placeholder="e.g. Ms. Fatima" full/>
              <PField label="How you know them" editing={editing} value={profile.ecRelation} onChange={v=>set("ecRelation",v)} placeholder="e.g. Teacher"/>
              <PField label="Their phone"       editing={editing} value={profile.ecPhone}    onChange={v=>set("ecPhone",v)}    placeholder="+91…" type="tel"/>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="prof-card">
          <div className="prof-card-hd"><span>🔐</span><h2>Account & Security</h2></div>
          <button className="prof-sec-btn">
            <div className="prof-sec-icon"><Shield size={15}/></div>
            <div>
              <p>Change Password</p>
              <small>Keep your account secure</small>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}

function PField({label,editing,value,onChange,type="text",full=false,placeholder=""}:{
  label:string;editing:boolean;value:string;onChange:(v:string)=>void;
  type?:string;full?:boolean;placeholder?:string;
}) {
  return (
    <div className={`prof-field${full?" prof-field--full":""}`}>
      <label>{label}</label>
      {editing
        ?<input type={type} className="prof-input" value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>
        :<div className="prof-value">{value||<span className="prof-empty-val">Not filled</span>}</div>}
    </div>
  );
}
