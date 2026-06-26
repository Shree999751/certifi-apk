import React, { useState } from 'react';

interface Contact {
  department: string;
  agency: string;
  phone: string;
  email: string;
  category: 'roads' | 'waste' | 'lights' | 'water' | 'emergency' | 'other';
  hours: string;
  responseTime: string;
}

interface CivicDirectoryProps {
  currentLocation: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  t: Record<string, string>;
}

// Contacts database categorized by city
const cityContacts: Record<string, Contact[]> = {
  delhi: [
    {
      department: 'Roads & Pothole Repair',
      agency: 'Municipal Corporation of Delhi (MCD)',
      phone: '011-23220010',
      email: 'roads.mcd@nic.in',
      category: 'roads',
      hours: '24/7 Control Room',
      responseTime: 'Average Resolution: 24 hrs'
    },
    {
      department: 'Waste Management & Garbage Dump',
      agency: 'MCD Swachhata Wing',
      phone: '123',
      email: 'swachh.mcd@gov.in',
      category: 'waste',
      hours: '6 AM - 10 PM',
      responseTime: 'Average Resolution: 12 hrs'
    },
    {
      department: 'Streetlights & Electrical',
      agency: 'BSES Yamuna / Tata Power DDL',
      phone: '1800-10-22279',
      email: 'customercare@tatapower-ddl.com',
      category: 'lights',
      hours: '24/7 Helpline',
      responseTime: 'Average Resolution: 6 hrs'
    },
    {
      department: 'Water Leakage & Sewage',
      agency: 'Delhi Jal Board (DJB)',
      phone: '1916',
      email: 'djbhelpline@delhi.gov.in',
      category: 'water',
      hours: '24/7 Toll-Free',
      responseTime: 'Average Resolution: 18 hrs'
    },
    {
      department: 'Municipal Corporation HQ',
      agency: 'PWD Delhi Control Room',
      phone: '1800-11-0093',
      email: 'pwdhelpline@delhi.gov.in',
      category: 'emergency',
      hours: '24/7 Control Center',
      responseTime: 'Average Resolution: 48 hrs'
    }
  ],
  bengaluru: [
    {
      department: 'Pothole & Road Repair Cell',
      agency: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
      phone: '080-22221188',
      email: 'comm@bbmp.gov.in',
      category: 'roads',
      hours: '24/7 Control Room',
      responseTime: 'Average Resolution: 36 hrs'
    },
    {
      department: 'Garbage & Solid Waste (SWM)',
      agency: 'BBMP Sanitation Cell',
      phone: '080-22660000',
      email: 'swm@bbmp.gov.in',
      category: 'waste',
      hours: '7 AM - 9 PM',
      responseTime: 'Average Resolution: 12 hrs'
    },
    {
      department: 'Streetlight & Grid Maintenance',
      agency: 'BESCOM Power Supply',
      phone: '1912',
      email: 'helpline@bescom.co.in',
      category: 'lights',
      hours: '24/7 Toll-Free Helpline',
      responseTime: 'Average Resolution: 4 hrs'
    },
    {
      department: 'Water Leaks & Pipe Bursts',
      agency: 'Bangalore Water Supply (BWSSB)',
      phone: '1916',
      email: 'bwssbhelpline@bwssb.gov.in',
      category: 'water',
      hours: '24/7 Call Center',
      responseTime: 'Average Resolution: 16 hrs'
    },
    {
      department: 'BBMP Disaster Management Unit',
      agency: 'BBMP Disaster Control',
      phone: '080-22221340',
      email: 'bbmpcontrol@gmail.com',
      category: 'emergency',
      hours: '24/7 Disaster Response',
      responseTime: 'Average Resolution: Instant'
    }
  ],
  mumbai: [
    {
      department: 'Road Potholes & Infrastructure',
      agency: 'Brihanmumbai Municipal Corporation (BMC)',
      phone: '022-22694725',
      email: 'mc@mcgm.gov.in',
      category: 'roads',
      hours: '24/7 Help Desk',
      responseTime: 'Average Resolution: 24 hrs'
    },
    {
      department: 'Solid Waste Management & Dumps',
      agency: 'BMC Cleanliness Cell',
      phone: '022-22754682',
      email: 'swm.mcgm@gov.in',
      category: 'waste',
      hours: '6 AM - 11 PM',
      responseTime: 'Average Resolution: 8 hrs'
    },
    {
      department: 'Streetlight Power Outages',
      agency: 'BEST Electric / Adani Power',
      phone: '19122',
      email: 'helpdesk@bestundertaking.com',
      category: 'lights',
      hours: '24/7 Helpline',
      responseTime: 'Average Resolution: 5 hrs'
    },
    {
      department: 'Water Pipeline Leaks',
      agency: 'BMC Hydraulic Department',
      phone: '022-22620251',
      email: 'waterdept@mcgm.gov.in',
      category: 'water',
      hours: '24/7 Toll-Free',
      responseTime: 'Average Resolution: 12 hrs'
    },
    {
      department: 'BMC Central Disaster Control',
      agency: 'BMC Emergency Management',
      phone: '1916',
      email: 'bmc disaster@gov.in',
      category: 'emergency',
      hours: '24/7 Emergency Cell',
      responseTime: 'Average Resolution: Instant'
    }
  ],
  chennai: [
    {
      department: 'GCC Roads Department',
      agency: 'Greater Chennai Corporation (GCC)',
      phone: '044-25381330',
      email: 'commissioner@chennaicorporation.gov.in',
      category: 'roads',
      hours: '24/7 Control Room',
      responseTime: 'Average Resolution: 24 hrs'
    },
    {
      department: 'GCC Garbage Cleanliness',
      agency: 'GCC Waste Management Cell',
      phone: '1913',
      email: 'swm.gcc@chennaicorporation.gov.in',
      category: 'waste',
      hours: '24/7 Public Line',
      responseTime: 'Average Resolution: 18 hrs'
    },
    {
      department: 'Streetlight Failures',
      agency: 'TANGEDCO (TNEB) Electrical',
      phone: '1912',
      email: 'helpline@tnebnet.org',
      category: 'lights',
      hours: '24/7 Outage Line',
      responseTime: 'Average Resolution: 8 hrs'
    },
    {
      department: 'Water Leakage & Sewage Block',
      agency: 'Chennai Metro Water (CMWSSB)',
      phone: '044-45674567',
      email: 'metrowater@cmwssb.gov.in',
      category: 'water',
      hours: '24/7 Help Center',
      responseTime: 'Average Resolution: 16 hrs'
    }
  ],
  hyderabad: [
    {
      department: 'GHMC Road Maintenance Wing',
      agency: 'Greater Hyderabad Municipal Corp (GHMC)',
      phone: '040-23262266',
      email: 'comm-ghmc@gov.in',
      category: 'roads',
      hours: '9 AM - 6 PM',
      responseTime: 'Average Resolution: 36 hrs'
    },
    {
      department: 'Garbage & Sanitation Desk',
      agency: 'GHMC Swachh Cell',
      phone: '040-23391039',
      email: 'swachh.ghmc@gov.in',
      category: 'waste',
      hours: '6 AM - 10 PM',
      responseTime: 'Average Resolution: 12 hrs'
    },
    {
      department: 'Streetlights & Transmission Outages',
      agency: 'TSSPDCL Electrical Help',
      phone: '1912',
      email: 'customercare@tsspdcl.org',
      category: 'lights',
      hours: '24/7 Power Support',
      responseTime: 'Average Resolution: 6 hrs'
    },
    {
      department: 'Water Leakage Control',
      agency: 'Hyderabad Metro Water (HMWSSB)',
      phone: '155313',
      email: 'hmwssbhelp@hmwssb.gov.in',
      category: 'water',
      hours: '24/7 Call Center',
      responseTime: 'Average Resolution: 18 hrs'
    },
    {
      department: 'GHMC Central Call Center',
      agency: 'GHMC Helpline Desk',
      phone: '040-21111111',
      email: 'callcentre-ghmc@telangana.gov.in',
      category: 'emergency',
      hours: '24/7 Toll-Free Support',
      responseTime: 'Average Resolution: 24 hrs'
    }
  ]
};

// Fallback state-level contacts database
const stateContacts: Record<string, Contact[]> = {
  karnataka: [
    {
      department: 'State Highways & Potholes',
      agency: 'Karnataka PWD Engineering',
      phone: '080-22277393',
      email: 'pwd.karnataka@gov.in',
      category: 'roads',
      hours: '9:30 AM - 6 PM',
      responseTime: 'Average Resolution: 48 hrs'
    },
    {
      department: 'Urban Development & Sanitation',
      agency: 'Karnataka Urban Water Supply (KUWS)',
      phone: '080-22238888',
      email: 'kuwsdb@gmail.com',
      category: 'water',
      hours: '24/7 Help Cell',
      responseTime: 'Average Resolution: 24 hrs'
    }
  ],
  maharashtra: [
    {
      department: 'Highways & PWD Works',
      agency: 'Maharashtra PWD HQ',
      phone: '022-22024141',
      email: 'pwd@maharashtra.gov.in',
      category: 'roads',
      hours: '10 AM - 5:30 PM',
      responseTime: 'Average Resolution: 72 hrs'
    },
    {
      department: 'Urban Outages & Helplines',
      agency: 'MahaVitaran Electrical Support',
      phone: '1800-212-3435',
      email: 'customercare@mahadiscom.in',
      category: 'lights',
      hours: '24/7 Support',
      responseTime: 'Average Resolution: 12 hrs'
    }
  ],
  delhi: [
    {
      department: 'PWD Road Control Room',
      agency: 'Delhi State PWD',
      phone: '1800-11-0093',
      email: 'pwdhelpline@delhi.gov.in',
      category: 'roads',
      hours: '24/7 Helpline',
      responseTime: 'Average Resolution: 24 hrs'
    }
  ]
};

// Generic National Helplines
const nationalContacts: Contact[] = [
  {
    department: 'National Swachhata Sanitation App Helpline',
    agency: 'Ministry of Housing & Urban Affairs',
    phone: '1969',
    email: 'swachhbharat@gov.in',
    category: 'waste',
    hours: '24/7 Toll-Free Desk',
    responseTime: 'Average Resolution: 24 hrs'
  },
  {
    department: 'National Highways Authority (NHAI) Control',
    agency: 'Ministry of Road Transport & Highways',
    phone: '1033',
    email: 'helpline@nhai.org',
    category: 'roads',
    hours: '24/7 Highway Control',
    responseTime: 'Average Resolution: 4 hrs (Highway only)'
  },
  {
    department: 'National Consumer Helpline',
    agency: 'Ministry of Consumer Affairs',
    phone: '1915',
    email: 'nch-ca@nic.in',
    category: 'emergency',
    hours: '8 AM - 8 PM',
    responseTime: 'Average Resolution: 72 hrs'
  },
  {
    department: 'National Disaster Response Force (NDRF)',
    agency: 'Ministry of Home Affairs',
    phone: '011-24363260',
    email: 'info.ndrf@nic.in',
    category: 'emergency',
    hours: '24/7 Control Room',
    responseTime: 'Average Resolution: Instant'
  }
];

export const CivicDirectory: React.FC<CivicDirectoryProps> = ({ currentLocation, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const normalizedCity = currentLocation.city.toLowerCase().trim();
  const normalizedState = currentLocation.state.toLowerCase().trim();

  // Get active contacts
  let contacts = cityContacts[normalizedCity] || [];
  
  // If city not found, try state level fallbacks
  if (contacts.length === 0) {
    contacts = stateContacts[normalizedState] || [];
  }

  // Always append national contacts as generic supportive channels
  const activeContactsList = [...contacts, ...nationalContacts];

  // Filtering
  const filteredContacts = activeContactsList.filter(contact => {
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    const matchesSearch = 
      contact.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (phoneNum: string) => {
    navigator.clipboard.writeText(phoneNum);
    setToastMessage(`${t.contactCopied || 'Phone number copied!'} (${phoneNum})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const categoryIcons: Record<string, string> = {
    roads: '🚧',
    waste: '🗑️',
    lights: '💡',
    water: '💧',
    emergency: '🚨',
    other: '🏢'
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="bg-canvas border border-hairline p-5 rounded-xl shadow-level2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-primary">
              🏢 {t.contactsTitle || 'Municipal Helplines Directory'}
            </h2>
            <p className="text-xs text-body leading-normal mt-0.5">
              {t.contactsSubtitle || 'Helplines and support contacts for'} <strong className="text-primary">{currentLocation.city}, {currentLocation.state}</strong>
            </p>
          </div>

          <div className="w-full md:w-72">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchDirectory || "Search by department..."}
              className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-sans"
            />
          </div>
        </div>

        {/* Category Filters Grid */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline/60">
          {[
            { id: 'all', label: 'All Depts', emoji: '🏢' },
            { id: 'roads', label: 'Roads & Potholes', emoji: '🚧' },
            { id: 'waste', label: 'Sanitation & Garbage', emoji: '🗑️' },
            { id: 'lights', label: 'Electricity & Lights', emoji: '💡' },
            { id: 'water', label: 'Water & Sewage', emoji: '💧' },
            { id: 'emergency', label: 'Disaster & Emergency', emoji: '🚨' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-8 px-3 rounded-full text-xs font-semibold font-sans transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-level2 scale-102 border-transparent'
                  : 'border border-hairline bg-canvas text-body hover:bg-canvas-soft-2 hover:border-primary/40'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredContacts.length === 0 ? (
        <div className="border border-hairline border-dashed rounded-xl p-12 text-center text-xs text-mute font-mono bg-canvas select-none">
          No matching contact lines found in database for this directory view.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact, index) => (
            <div 
              key={contact.phone + index}
              className="group border border-hairline bg-canvas rounded-xl p-4.5 shadow-level2 hover:shadow-level3 hover:border-primary/30 transition-all duration-200 flex flex-col justify-between space-y-4 hover:scale-[1.01]"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="font-bold text-xs text-primary leading-tight font-sans group-hover:text-link transition duration-150">
                      {contact.department}
                    </span>
                    <span className="text-[10px] text-mute uppercase font-mono tracking-wider leading-none mt-1">
                      {contact.agency}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-canvas-soft-2 border border-hairline flex items-center justify-center text-lg shadow-sm">
                    {categoryIcons[contact.category] || '🏢'}
                  </div>
                </div>

                <div className="text-[10px] text-mute font-mono bg-canvas-soft border border-hairline/60 rounded px-2.5 py-1.5 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <span className="font-semibold text-primary">{contact.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance:</span>
                    <span className="font-semibold text-primary">{contact.responseTime}</span>
                  </div>
                  {contact.email && (
                    <div className="flex justify-between truncate select-all">
                      <span>Email:</span>
                      <span className="text-primary truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-hairline/60">
                <a 
                  href={`tel:${contact.phone.replace(/[-\s]/g, '')}`}
                  className="flex-1 h-8 rounded-full border border-hairline bg-canvas-soft hover:bg-primary hover:text-on-primary hover:border-transparent text-primary text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 font-sans"
                >
                  📞 {t.callButton || 'Call'}
                </a>
                <button 
                  onClick={() => handleCopy(contact.phone)}
                  className="flex-1 h-8 rounded-full border border-hairline bg-canvas text-body hover:bg-canvas-soft-2 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 font-sans"
                >
                  📋 {t.copyButton || 'Copy Number'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Floating Micro Toast Validation Confirmation */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[6000] bg-primary text-on-primary border border-hairline-strong shadow-level5 rounded-full px-5 py-2.5 text-xs font-mono font-bold animate-bounce flex items-center gap-2">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
