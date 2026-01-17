import React, { useState, useEffect } from 'react';
import { User, CreditPackage, SystemSettings, SubscriptionPlan } from '../types';
import { ShoppingBag, Crown, Zap, Lock, Calendar, Sparkles, ArrowRight, CheckCircle, Video, BookOpen, Star, MessageSquare, Shield, X } from 'lucide-react';

interface Props {
  user: User;
  settings?: SystemSettings;
  onUserUpdate: (user: User) => void;
}

const DEFAULT_PACKAGES: CreditPackage[] = [
  { id: 'pkg-1', name: '100 Credits', credits: 100, price: 10 },
  { id: 'pkg-2', name: '200 Credits', credits: 200, price: 20 },
  { id: 'pkg-3', name: '500 Credits', credits: 500, price: 50 },
  { id: 'pkg-4', name: '1000 Credits', credits: 1000, price: 100 },
  { id: 'pkg-5', name: '2000 Credits', credits: 2000, price: 200 },
  { id: 'pkg-6', name: '5000 Credits', credits: 5000, price: 500 },
  { id: 'pkg-7', name: '10000 Credits', credits: 10000, price: 1000 }
];

export const Store: React.FC<Props> = ({ user, settings, onUserUpdate }) => {
  const [tierType, setTierType] = useState<'BASIC' | 'ULTRA'>('ULTRA'); // Default to Ultra for upsell
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const packages = settings?.packages || DEFAULT_PACKAGES;
  const subscriptionPlans = settings?.subscriptionPlans || [];
  
  // Set default selected plan
  useEffect(() => {
    if (subscriptionPlans.length > 0 && !selectedPlanId) {
      // Try to find "Monthly" or first
      const defaultPlan = subscriptionPlans.find(p => p.name.includes('Monthly')) || subscriptionPlans[0];
      setSelectedPlanId(defaultPlan.id);
    }
  }, [subscriptionPlans]);

  const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);

  // NEW: Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<any>(null); // Plan or CreditPackage

  const handleSupportClick = (numEntry: any) => {
      if (!purchaseItem) return;
      
      const isSub = purchaseItem.duration !== undefined; // Detect if Sub Plan
      const itemName = purchaseItem.name;
      const price = isSub 
          ? (tierType === 'BASIC' ? purchaseItem.basicPrice : purchaseItem.ultraPrice)
          : purchaseItem.price;
      
      const features = isSub 
          ? (tierType === 'BASIC' ? 'MCQ + Notes' : 'PDF + Videos + AI Studio')
          : `${purchaseItem.credits} Credits`;

      const message = `Hello Admin, I want to buy:\n\nItem: ${itemName} ${isSub ? `(${tierType})` : ''}\nPrice: ₹${price}\nUser ID: ${user.id}\nDetails: ${features}\n\nPlease share payment details.`;
      
      window.open(`https://wa.me/91${numEntry.number}?text=${encodeURIComponent(message)}`, '_blank');
      setShowSupportModal(false);
  };

  const initiatePurchase = (item: any) => {
      setPurchaseItem(item);
      setShowSupportModal(true);
  };

  if (settings?.isPaymentEnabled === false) {
    return (
      <div className="animate-in fade-in zoom-in duration-300 pb-10">
        <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 text-center shadow-2xl">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700">
            <Lock size={40} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-200 mb-2">Store Locked</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            {settings.paymentDisabledMessage || "Purchases are currently disabled by the Admin. Please check back later."}
          </p>
        </div>
      </div>
    );
  }

  // Derived Data
  const currentFeatures = tierType === 'BASIC' 
    ? [
        '✅ All MCQs Unlocked',
        '✅ Standard Notes Access',
        '✅ Daily 5 Spin Limit',
        '✅ Basic AI Chat Access',
        '❌ Video Lectures (Locked)',
        '❌ Offline Downloads (Locked)',
        '❌ Competition Mode (Locked)'
      ] 
    : [
        '✅ All MCQs Unlocked',
        '✅ Premium Deep-Dive Notes',
        '✅ Full Video Lectures',
        '✅ Offline Downloads',
        '✅ 10 Daily Spins',
        '✅ Priority AI Support',
        '✅ Competition Mode Access',
        '✅ Ad-Free Experience'
      ];

  const currentPrice = selectedPlan 
    ? (tierType === 'BASIC' ? selectedPlan.basicPrice : selectedPlan.ultraPrice)
    : 0;

  const originalPrice = selectedPlan
    ? (tierType === 'BASIC' ? selectedPlan.basicOriginalPrice : selectedPlan.ultraOriginalPrice)
    : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24 relative">
      
      {/* SUPPORT CHANNEL SELECTOR MODAL */}
      {showSupportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white text-center">
                      <h3 className="font-black text-lg flex items-center justify-center gap-2">
                          <MessageSquare size={20} /> Select Support Channel
                      </h3>
                      <p className="text-xs text-green-100 mt-1">Choose a number to proceed with payment</p>
                  </div>
                  <div className="p-4 space-y-3">
                      {(settings?.paymentNumbers || [{id: 'def', name: 'Main Support', number: '8227070298', dailyClicks: 0}]).map((num, idx) => {
                          const totalClicks = settings?.paymentNumbers?.reduce((acc, curr) => acc + (curr.dailyClicks || 0), 0) || 1;
                          const traffic = Math.round(((num.dailyClicks || 0) / totalClicks) * 100);
                          const isGreen = traffic < 30;

                          return (
                              <button 
                                  key={num.id}
                                  onClick={() => handleSupportClick(num)}
                                  className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center hover:bg-slate-700 hover:border-green-500/50 transition-all group"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isGreen ? 'bg-green-600' : 'bg-orange-500'}`}>
                                          {num.name.charAt(0)}
                                      </div>
                                      <div className="text-left">
                                          <p className="font-bold text-slate-200 text-sm group-hover:text-green-400">{num.name}</p>
                                          <p className="text-[10px] text-slate-500">{isGreen ? '✅ Fast Response' : '⚠️ High Traffic'}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <span className={`text-xs font-black ${isGreen ? 'text-green-500' : 'text-orange-500'}`}>{traffic}% Busy</span>
                                  </div>
                              </button>
                          );
                      })}
                  </div>
                  <div className="p-4 bg-slate-800 border-t border-slate-700 text-center">
                      <button onClick={() => setShowSupportModal(false)} className="text-slate-400 font-bold text-sm hover:text-white">Cancel</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- NEW OUC STYLE STORE --- */}
      <div className="bg-slate-950 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
          
          {/* HEADER & TOGGLE */}
          <div className="p-8 pb-4 text-center">
              <div className="inline-block mb-4">
                 <Crown size={32} className="text-slate-200 mx-auto mb-2" />
                 <h2 className="text-3xl font-serif text-slate-100 tracking-tight">Select your plan</h2>
                 <p className="text-slate-500 text-sm mt-1">Unlock the full potential of your learning.</p>
              </div>

              {/* TOGGLE */}
              <div className="flex justify-center mt-4">
                  <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex relative">
                      {/* Sliding Background */}
                      <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-800 rounded-full transition-all duration-300 ease-out border border-slate-700 shadow-sm ${
                            tierType === 'ULTRA' ? 'left-[calc(50%)]' : 'left-1'
                        }`}
                      />
                      
                      <button 
                          onClick={() => setTierType('BASIC')}
                          className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors ${
                              tierType === 'BASIC' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                          Basic
                      </button>
                      <button 
                          onClick={() => setTierType('ULTRA')}
                          className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${
                              tierType === 'ULTRA' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                          Ultra <Sparkles size={12} className={tierType === 'ULTRA' ? "fill-yellow-400" : ""} />
                      </button>
                  </div>
              </div>
          </div>

          {/* FEATURES LIST */}
          <div className="px-8 py-4">
             <div className="space-y-3">
                 {currentFeatures.map((feat, i) => (
                     <div key={i} className={`flex items-start gap-3 text-sm ${feat.includes('❌') ? 'text-slate-600' : 'text-slate-300'}`}>
                         <span className="mt-0.5">{feat.startsWith('✅') ? <CheckCircle size={16} className={tierType === 'ULTRA' ? "text-yellow-500" : "text-blue-500"} /> : <X size={16} />}</span>
                         <span>{feat.replace(/^[✅❌]\s/, '')}</span>
                     </div>
                 ))}
             </div>
          </div>

          {/* DURATION SELECTOR */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3 ml-2">Choose Duration</p>
              <div className="grid grid-cols-2 gap-3">
                  {subscriptionPlans.map(plan => {
                      const isSelected = selectedPlanId === plan.id;
                      const price = tierType === 'BASIC' ? plan.basicPrice : plan.ultraPrice;
                      const orig = tierType === 'BASIC' ? plan.basicOriginalPrice : plan.ultraOriginalPrice;

                      return (
                          <button
                              key={plan.id}
                              onClick={() => setSelectedPlanId(plan.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                                  isSelected 
                                    ? (tierType === 'ULTRA' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-blue-500/50 bg-blue-500/10') 
                                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                              }`}
                          >
                              {plan.popular && (
                                  <div className={`absolute top-0 right-0 px-2 py-0.5 text-[9px] font-black uppercase rounded-bl-lg ${
                                      tierType === 'ULTRA' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                                  }`}>
                                      Popular
                                  </div>
                              )}
                              
                              <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{plan.name}</p>
                              <p className="text-xs text-slate-500 mb-2">{plan.duration}</p>
                              
                              <div className="flex items-baseline gap-1.5">
                                  <span className={`text-lg font-black ${
                                      isSelected 
                                        ? (tierType === 'ULTRA' ? 'text-yellow-400' : 'text-blue-400') 
                                        : 'text-slate-300'
                                  }`}>₹{price}</span>
                                  {orig && <span className="text-xs line-through text-slate-600">₹{orig}</span>}
                              </div>
                          </button>
                      );
                  })}
              </div>
          </div>

          {/* BOTTOM ACTION CARD */}
          <div className="p-6 bg-slate-900 border-t border-slate-800">
             <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between mb-4">
                 <div>
                     <p className="text-xs text-slate-500 font-bold uppercase">{selectedPlan?.name || 'Select Plan'}</p>
                     <p className="text-2xl font-serif text-white">₹{currentPrice}<span className="text-sm font-sans text-slate-500 font-normal">.00</span></p>
                 </div>
                 {tierType === 'ULTRA' && <Crown size={32} className="text-yellow-500/20" />}
             </div>

             <button
                 onClick={() => selectedPlan && initiatePurchase(selectedPlan)}
                 className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                     tierType === 'ULTRA' 
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/20' 
                        : 'bg-white text-black hover:bg-slate-200 shadow-white/10'
                 }`}
             >
                 Get {tierType === 'ULTRA' ? 'Max' : 'Pro'} Access
             </button>
          </div>

      </div>

      {/* COIN STORE (Dark Variant) */}
      <div className="mt-12">
          <div className="flex items-center gap-3 mb-6 px-4">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Or Top-up Coins</span>
              <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {packages.map(pkg => (
                  <button
                      key={pkg.id}
                      onClick={() => initiatePurchase(pkg)}
                      className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
                  >
                      <div className="flex justify-between items-start mb-2">
                          <Zap size={20} className="text-amber-500 fill-amber-500" />
                          <span className="bg-slate-950 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-800">₹{pkg.price}</span>
                      </div>
                      <p className="text-white font-black text-lg group-hover:text-amber-400 transition-colors">{pkg.credits}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold">Credits</p>
                  </button>
              ))}
          </div>
      </div>

    </div>
  );
};
