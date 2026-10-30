export interface BabyNameEntry {
  id: string;
  name: string;
  meaning: string;
  significance: string;
  gender: 'Male' | 'Female' | 'Unisex';
  origin: string;
  language: string;
  pronunciation?: string;
  contributedBy?: string;
  createdAt?: string;
}

export const INITIAL_GLOBAL_BABY_NAMES: BabyNameEntry[] = [
  // A
  {
    id: 'bn-adaeze',
    name: 'Adaeze',
    meaning: 'Daughter of a King; Princess',
    significance: 'Traditionally bestowed upon a firstborn daughter in Igbo culture to signify royal dignity, grace, and leadership within the family.',
    gender: 'Female',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'ah-dah-EH-zeh'
  },
  {
    id: 'bn-adebayo',
    name: 'Adebayo',
    meaning: 'The crown meets joy; He came in a joyful time',
    significance: 'A classic Yoruba name celebrating a child born during a season of family prosperity, peace, and celebration.',
    gender: 'Male',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'ah-deh-BAH-yaw'
  },
  {
    id: 'bn-amara',
    name: 'Amara',
    meaning: 'Grace, mercy, kindness, and eternal beauty',
    significance: 'Found across Igbo (short for Amarachi, meaning Grace of God), Sanskrit (immortal), and Latin roots, symbolizing divine favor.',
    gender: 'Female',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'ah-MAH-rah'
  },
  {
    id: 'bn-amina',
    name: 'Amina',
    meaning: 'Trustworthy, faithful, peaceful, and secure',
    significance: 'Honors Queen Amina of Zazzau (Hausa warrior queen) and Amina bint Wahb, symbolizing strength, honesty, and serenity.',
    gender: 'Female',
    origin: 'North African',
    language: 'Arabic',
    pronunciation: 'ah-MEE-nah'
  },
  {
    id: 'bn-amani',
    name: 'Amani',
    meaning: 'Peace, harmony, and heartfelt wishes',
    significance: 'Widely cherished across East Africa and the Arab world as a prayer that the child brings unity and calm to the community.',
    gender: 'Unisex',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'ah-MAH-nee'
  },
  {
    id: 'bn-arjun',
    name: 'Arjun',
    meaning: 'Bright, shining, silver, and pure of heart',
    significance: 'Rooted in ancient Sanskrit literature, representing focus, courage, and moral clarity.',
    gender: 'Male',
    origin: 'South Asian',
    language: 'Sanskrit',
    pronunciation: 'AR-jun'
  },
  {
    id: 'bn-aurelia',
    name: 'Aurelia',
    meaning: 'The golden one; gilded with sunlight',
    significance: 'An ancient Roman name given to signify warmth, radiance, and precious value.',
    gender: 'Female',
    origin: 'European',
    language: 'Latin',
    pronunciation: 'aw-RAY-lee-uh'
  },
  {
    id: 'bn-ayomide',
    name: 'Ayomide',
    meaning: 'My joy has arrived',
    significance: 'A deeply expressive Yoruba name expressing a parent’s gratitude and relief at the safe arrival of their baby.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'ah-yaw-MEE-day'
  },

  // B
  {
    id: 'bn-baraka',
    name: 'Baraka',
    meaning: 'Blessing, abundance, and divine grace',
    significance: 'Given across East Africa to celebrate a child whose birth brings spiritual and material blessings to the household.',
    gender: 'Unisex',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'bah-RAH-kah'
  },
  {
    id: 'bn-binta',
    name: 'Binta',
    meaning: 'With the heart; close to God; daughter',
    significance: 'Popular across West African Fulani, Mandinka, and Hausa communities, symbolizing devotion and family warmth.',
    gender: 'Female',
    origin: 'West African',
    language: 'Hausa',
    pronunciation: 'BIN-tah'
  },
  {
    id: 'bn-bodhi',
    name: 'Bodhi',
    meaning: 'Awakening, enlightenment, and supreme wisdom',
    significance: 'Signifies spiritual mindfulness, deep understanding, and a peaceful life journey.',
    gender: 'Unisex',
    origin: 'South Asian',
    language: 'Sanskrit',
    pronunciation: 'BOH-dee'
  },
  {
    id: 'bn-beatrice',
    name: 'Beatrice',
    meaning: 'She who brings happiness and blessings',
    significance: 'Derived from Latin Beatrix (voyager/blessed), associated with wisdom, poetic guidance, and joy.',
    gender: 'Female',
    origin: 'European',
    language: 'Latin',
    pronunciation: 'BEE-uh-tris'
  },

  // C
  {
    id: 'bn-chimamanda',
    name: 'Chimamanda',
    meaning: 'My God will never fail; My spirit will never fall',
    significance: 'An Igbo affirmation of unshakeable resilience, divine protection, and enduring hope.',
    gender: 'Female',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'chee-mah-MAHN-dah'
  },
  {
    id: 'bn-chinedu',
    name: 'Chinedu',
    meaning: 'God leads; Divine guidance',
    significance: 'Reflects the family’s trust that the child’s path through life is continually guided by providence and wisdom.',
    gender: 'Male',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'chee-NEH-doo'
  },
  {
    id: 'bn-callum',
    name: 'Callum',
    meaning: 'Dove; messenger of peace',
    significance: 'A traditional Scottish Gaelic name derived from Latin Columba, symbolizing gentleness, peace, and renewal.',
    gender: 'Male',
    origin: 'Celtic',
    language: 'Gaelic',
    pronunciation: 'KAL-um'
  },
  {
    id: 'bn-clara',
    name: 'Clara',
    meaning: 'Clear, bright, and luminous',
    significance: 'Symbolizes intellectual clarity, honesty, and a radiant spirit that brightens the lives of others.',
    gender: 'Female',
    origin: 'European',
    language: 'Latin',
    pronunciation: 'KLAHR-uh'
  },

  // D
  {
    id: 'bn-damilola',
    name: 'Damilola',
    meaning: 'Bless me with wealth, honor, and dignity',
    significance: 'In Yoruba tradition, wealth (ola) encompasses good health, noble character, and community respect.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'dah-mee-LAW-lah'
  },
  {
    id: 'bn-dalitso',
    name: 'Dalitso',
    meaning: 'Blessing; Grace',
    significance: 'A beloved Chichewa name from Southern/Central Africa celebrating a child as a cherished gift.',
    gender: 'Unisex',
    origin: 'Southern African',
    language: 'Chichewa',
    pronunciation: 'dah-LEET-so'
  },
  {
    id: 'bn-darius',
    name: 'Darius',
    meaning: 'He who holds firm the good; maintainer of prosperity',
    significance: 'Ancient Persian royal name symbolizing benevolent leadership, protection, and steadfastness.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Persian',
    pronunciation: 'duh-RYE-us'
  },

  // E
  {
    id: 'bn-emeka',
    name: 'Emeka',
    meaning: 'Great deeds; God has done so much',
    significance: 'Short for Chukwuemeka in Igbo, expressing deep thanksgiving for the miracle of childbirth.',
    gender: 'Male',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'eh-MEH-kah'
  },
  {
    id: 'bn-eniola',
    name: 'Eniola',
    meaning: 'Person of wealth, honor, and high esteem',
    significance: 'Bestowed in Yoruba families to affirm that a child is born into love, dignity, and abundant potential.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'eh-nee-AW-lah'
  },
  {
    id: 'bn-eliora',
    name: 'Eliora',
    meaning: 'The Lord is my light',
    significance: 'A Hebrew name signifying spiritual illumination, warmth, and hope during new beginnings.',
    gender: 'Female',
    origin: 'Middle Eastern',
    language: 'Hebrew',
    pronunciation: 'eh-lee-OR-uh'
  },
  {
    id: 'bn-ethan',
    name: 'Ethan',
    meaning: 'Strong, enduring, firm, and long-lived',
    significance: 'Biblical Hebrew name associated with wisdom, reliability, and unshakeable strength.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Hebrew',
    pronunciation: 'EE-thun'
  },

  // F
  {
    id: 'bn-faraji',
    name: 'Faraji',
    meaning: 'Consolation, comfort, and relief',
    significance: 'A Swahili name given to a child who brings healing, joy, and comfort to their family.',
    gender: 'Male',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'fah-RAH-jee'
  },
  {
    id: 'bn-fatima',
    name: 'Fatima',
    meaning: 'Captivating; one who abstains from wrong; nurturing mother',
    significance: 'Revered across the Islamic world for compassion, wisdom, and devotion to family.',
    gender: 'Female',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'FAH-tee-mah'
  },
  {
    id: 'bn-freya',
    name: 'Freya',
    meaning: 'Noble lady; bringer of love and fertility',
    significance: 'Old Norse name celebrating beauty, strength, and protective care over family and nature.',
    gender: 'Female',
    origin: 'European',
    language: 'Norse',
    pronunciation: 'FRAY-uh'
  },

  // G
  {
    id: 'bn-gabriel',
    name: 'Gabriel',
    meaning: 'God is my strength',
    significance: 'Recognized across Hebrew, Christian, and Islamic traditions as the herald of good news and divine comfort.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Hebrew',
    pronunciation: 'GAY-bree-ul'
  },
  {
    id: 'bn-ginevra',
    name: 'Ginevra',
    meaning: 'Fair, luminous, and pure spirit',
    significance: 'Italian form of Guinevere with Celtic roots, associated with grace, poise, and kindness.',
    gender: 'Female',
    origin: 'European',
    language: 'Italian',
    pronunciation: 'jee-NEV-rah'
  },

  // H
  {
    id: 'bn-halima',
    name: 'Halima',
    meaning: 'Gentle, patient, mild-mannered, and generous',
    significance: 'Honors Halima al-Sa’diyya, symbolizing nurturing care, maternal warmth, and calm wisdom.',
    gender: 'Female',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'hah-LEE-mah'
  },
  {
    id: 'bn-haruki',
    name: 'Haruki',
    meaning: 'Shining sun; springtime radiance',
    significance: 'A Japanese name combining "haru" (spring/clear weather) and "ki" (radiance/tree), symbolizing fresh growth and vitality.',
    gender: 'Male',
    origin: 'East Asian',
    language: 'Japanese',
    pronunciation: 'hah-ROO-kee'
  },

  // I
  {
    id: 'bn-ifeoma',
    name: 'Ifeoma',
    meaning: 'A good and beautiful thing',
    significance: 'An Igbo name celebrating the child as a pure blessing and a source of pride and goodness.',
    gender: 'Female',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'ee-feh-AW-mah'
  },
  {
    id: 'bn-imani',
    name: 'Imani',
    meaning: 'Faith, belief, and steadfast trust',
    significance: 'A cornerstone Swahili and Arabic-rooted name representing spiritual confidence and family unity.',
    gender: 'Female',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'ee-MAH-nee'
  },
  {
    id: 'bn-idris',
    name: 'Idris',
    meaning: 'Studious, smart, interpreter; ardent lord',
    significance: 'Found in both Arabic (honoring a wise prophet associated with learning) and Welsh (ardent leader) traditions.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'ih-DREES'
  },

  // J
  {
    id: 'bn-jideofor',
    name: 'Jideofor',
    meaning: 'Hold fast to justice, truth, and righteousness',
    significance: 'An Igbo philosophical name reminding the child to walk through life with integrity and fairness.',
    gender: 'Male',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'jee-deh-AW-faw'
  },
  {
    id: 'bn-jendayi',
    name: 'Jendayi',
    meaning: 'Give thanks; grateful heart',
    significance: 'A Shona name from Southern Africa expressing heartfelt gratitude for new life.',
    gender: 'Female',
    origin: 'Southern African',
    language: 'Shona',
    pronunciation: 'jen-DAH-yee'
  },
  {
    id: 'bn-julian',
    name: 'Julian',
    meaning: 'Youthful, sky-father, and spirited',
    significance: 'Classical Latin name associated with vitality, intellect, and timeless warmth.',
    gender: 'Male',
    origin: 'European',
    language: 'Latin',
    pronunciation: 'JOO-lee-un'
  },

  // K
  {
    id: 'bn-kofi',
    name: 'Kofi',
    meaning: 'Born on Friday; wanderer and peacemaker',
    significance: 'An Akan day name from Ghana; Friday-born children are traditionally associated with creativity, adventure, and diplomacy.',
    gender: 'Male',
    origin: 'West African',
    language: 'Akan / Twi',
    pronunciation: 'KOH-fee'
  },
  {
    id: 'bn-kamdilichukwu',
    name: 'Kamdilichukwu',
    meaning: 'Let me live for God; May my life honor the Creator',
    significance: 'Modern Igbo name (often shortened to Kamdi) expressing a prayer for a purposeful, protected life.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'kahm-dee-lee-CHOO-kwoo'
  },
  {
    id: 'bn-kaia',
    name: 'Kaia',
    meaning: 'The sea; pure; earth and stability',
    significance: 'Multicultural name with Hawaiian (the sea), Greek (pure), and Scandinavian roots, evoking calm natural strength.',
    gender: 'Female',
    origin: 'Global',
    language: 'Hawaiian',
    pronunciation: 'KYE-uh'
  },

  // L
  {
    id: 'bn-lerato',
    name: 'Lerato',
    meaning: 'Love and compassion',
    significance: 'A Sesotho and Setswana name from Southern Africa celebrating unconditional family love.',
    gender: 'Unisex',
    origin: 'Southern African',
    language: 'Sesotho',
    pronunciation: 'leh-RAH-toh'
  },
  {
    id: 'bn-leila',
    name: 'Leila',
    meaning: 'Night beauty; born at night',
    significance: 'Poetic Arabic and Persian name symbolizing serenity, mystery, and starlight.',
    gender: 'Female',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'LAY-lah'
  },
  {
    id: 'bn-liam',
    name: 'Liam',
    meaning: 'Strong-willed warrior and resolute protector',
    significance: 'Irish form of William, symbolizing courage and steadfast protection of loved ones.',
    gender: 'Male',
    origin: 'Celtic',
    language: 'Irish',
    pronunciation: 'LEE-um'
  },

  // M
  {
    id: 'bn-makena',
    name: 'Makena',
    meaning: 'The happy one; filled with joy',
    significance: 'A Kikuyu name from Kenya celebrating a cheerful spirit and joyful family milestone.',
    gender: 'Female',
    origin: 'East African',
    language: 'Kikuyu',
    pronunciation: 'mah-KEH-nah'
  },
  {
    id: 'bn-mateo',
    name: 'Mateo',
    meaning: 'Gift of God',
    significance: 'Spanish form of Matthew (from Hebrew Mattityahu), cherished globally as a thanksgiving name.',
    gender: 'Male',
    origin: 'European',
    language: 'Spanish',
    pronunciation: 'mah-TAY-oh'
  },
  {
    id: 'bn-mei',
    name: 'Mei',
    meaning: 'Beautiful; plum blossom',
    significance: 'In Chinese tradition, the plum blossom blooms in late winter, symbolizing resilience, elegance, and renewal.',
    gender: 'Female',
    origin: 'East Asian',
    language: 'Chinese',
    pronunciation: 'MAY'
  },

  // N
  {
    id: 'bn-ngozi',
    name: 'Ngozi',
    meaning: 'Blessing; Divine favor',
    significance: 'One of the most beloved Igbo names, affirming that the child brings abundant blessings to the home.',
    gender: 'Female',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'n-GAW-zee'
  },
  {
    id: 'bn-nia',
    name: 'Nia',
    meaning: 'Purpose, resolve, and bright radiance',
    significance: 'In Swahili, Nia means purpose (one of the seven principles of Kwanzaa); in Welsh, it means bright.',
    gender: 'Female',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'NEE-uh'
  },
  {
    id: 'bn-noah',
    name: 'Noah',
    meaning: 'Rest, comfort, and peacefulness',
    significance: 'Ancient Hebrew name symbolizing sanctuary, new beginnings, and calm resilience.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Hebrew',
    pronunciation: 'NOH-uh'
  },

  // O
  {
    id: 'bn-oluchi',
    name: 'Oluchi',
    meaning: 'The handiwork of God; God’s masterpiece',
    significance: 'An Igbo name celebrating the wonder and perfection of a newborn child.',
    gender: 'Female',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'oh-LOO-chee'
  },
  {
    id: 'bn-oluwaseun',
    name: 'Oluwaseun',
    meaning: 'We thank the Lord',
    significance: 'A Yoruba expression of deep gratitude for safe delivery and family health.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'oh-loo-wah-SHEH-oon'
  },
  {
    id: 'bn-omar',
    name: 'Omar',
    meaning: 'Flourishing, thriving, and long-lived',
    significance: 'Classic Arabic name derived from "amr" (life), wishing the child a prosperous, impactful life.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'OH-mar'
  },

  // P
  {
    id: 'bn-palesa',
    name: 'Palesa',
    meaning: 'Flower; blooming beauty',
    significance: 'A Sesotho name from Southern Africa symbolizing natural beauty, tenderness, and growth.',
    gender: 'Female',
    origin: 'Southern African',
    language: 'Sesotho',
    pronunciation: 'pah-LEH-sah'
  },
  {
    id: 'bn-priya',
    name: 'Priya',
    meaning: 'Beloved, dear one, and cherished',
    significance: 'Sanskrit name expressing the deep affection and warmth surrounding the child.',
    gender: 'Female',
    origin: 'South Asian',
    language: 'Sanskrit',
    pronunciation: 'PREE-yah'
  },

  // Q
  {
    id: 'bn-qasim',
    name: 'Qasim',
    meaning: 'One who shares generously; distributor of good',
    significance: 'An Arabic name celebrating generosity, fairness, and community spirit.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'KAH-sim'
  },
  {
    id: 'bn-quinn',
    name: 'Quinn',
    meaning: 'Wise counsel, intelligence, and noble leader',
    significance: 'Derived from Irish Gaelic Ó Cuinn, representing sharp intellect and balanced leadership.',
    gender: 'Unisex',
    origin: 'Celtic',
    language: 'Irish',
    pronunciation: 'KWIN'
  },

  // R
  {
    id: 'bn-rafiki',
    name: 'Rafiki',
    meaning: 'True friend and loyal companion',
    significance: 'A Swahili name honoring friendship, kindness, and dependability.',
    gender: 'Male',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'rah-FEE-kee'
  },
  {
    id: 'bn-ruvimbo',
    name: 'Ruvimbo',
    meaning: 'Trust, faith, and confidence',
    significance: 'A Shona name celebrating faith in the future and trustworthiness.',
    gender: 'Female',
    origin: 'Southern African',
    language: 'Shona',
    pronunciation: 'roo-VEEM-boh'
  },
  {
    id: 'bn-raphael',
    name: 'Raphael',
    meaning: 'God has healed',
    significance: 'Hebrew name associated with healing, restoration, and protective care.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Hebrew',
    pronunciation: 'rah-fah-EL'
  },

  // S
  {
    id: 'bn-simisola',
    name: 'Simisola',
    meaning: 'Rest in wealth, peace, and honor',
    significance: 'A soothing Yoruba name wishing the child a life free of turmoil and filled with abundance.',
    gender: 'Female',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'see-mee-SHAW-lah'
  },
  {
    id: 'bn-sipho',
    name: 'Sipho',
    meaning: 'A precious gift',
    significance: 'A classic Zulu and Xhosa name acknowledging the baby as a sacred gift to the family.',
    gender: 'Male',
    origin: 'Southern African',
    language: 'Zulu',
    pronunciation: 'SEE-poh'
  },
  {
    id: 'bn-sofia',
    name: 'Sofia',
    meaning: 'Wisdom and deep understanding',
    significance: 'Derived from Greek Sophia, cherished across Europe, the Mediterranean, and Latin America as a symbol of insight.',
    gender: 'Female',
    origin: 'European',
    language: 'Greek',
    pronunciation: 'so-FEE-uh'
  },

  // T
  {
    id: 'bn-temitope',
    name: 'Temitope',
    meaning: 'Mine is worthy of thanksgiving and praise',
    significance: 'A joyful Yoruba name celebrating gratitude for a blessing that exceeded expectations.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'teh-mee-TAW-peh'
  },
  {
    id: 'bn-thandiwe',
    name: 'Thandiwe',
    meaning: 'Beloved; deeply loved by all',
    significance: 'A Nguni (Zulu, Xhosa, Ndebele) name radiating warmth, acceptance, and affection.',
    gender: 'Female',
    origin: 'Southern African',
    language: 'Zulu',
    pronunciation: 'tahn-DEE-weh'
  },
  {
    id: 'bn-tariku',
    name: 'Tariku',
    meaning: 'His story; destiny and legacy',
    significance: 'An Ethiopian Amharic name celebrating the unique story and legacy the child will write.',
    gender: 'Male',
    origin: 'East African',
    language: 'Amharic',
    pronunciation: 'tah-REE-koo'
  },

  // U
  {
    id: 'bn-uchechukwu',
    name: 'Uchechukwu',
    meaning: 'The will and wisdom of God',
    significance: 'An Igbo name (often shortened to Uche) honoring divine purpose and thoughtful character.',
    gender: 'Unisex',
    origin: 'West African',
    language: 'Igbo',
    pronunciation: 'oo-cheh-CHOO-kwoo'
  },
  {
    id: 'bn-umar',
    name: 'Umar',
    meaning: 'Populous, flourishing, and life-giving',
    significance: 'Classical Arabic name associated with justice, strength of character, and longevity.',
    gender: 'Male',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'OO-mar'
  },

  // V
  {
    id: 'bn-victoria',
    name: 'Victoria',
    meaning: 'Victory and triumph',
    significance: 'Latin name celebrating resilience, overcoming obstacles, and joyful triumph.',
    gender: 'Female',
    origin: 'European',
    language: 'Latin',
    pronunciation: 'vik-TOR-ee-uh'
  },
  {
    id: 'bn-vihaan',
    name: 'Vihaan',
    meaning: 'Dawn; the first ray of morning sunlight',
    significance: 'Sanskrit name symbolizing a fresh beginning, optimism, and radiant hope.',
    gender: 'Male',
    origin: 'South Asian',
    language: 'Sanskrit',
    pronunciation: 'vih-HAHN'
  },

  // W
  {
    id: 'bn-wanjiku',
    name: 'Wanjiku',
    meaning: 'Of the ceremonial clan; builder of community',
    significance: 'Honors one of the nine foundational matriarchal daughters of Gikuyu and Mumbi in Kenyan heritage.',
    gender: 'Female',
    origin: 'East African',
    language: 'Kikuyu',
    pronunciation: 'wahn-JEE-koo'
  },
  {
    id: 'bn-wyatt',
    name: 'Wyatt',
    meaning: 'Brave and hardy in battle; strong protector',
    significance: 'Old English name symbolizing resilience, courage, and steadfast spirit.',
    gender: 'Male',
    origin: 'European',
    language: 'English',
    pronunciation: 'WYE-ut'
  },

  // X
  {
    id: 'bn-xolani',
    name: 'Xolani',
    meaning: 'Please forgive; be at peace',
    significance: 'A Zulu and Xhosa name encouraging reconciliation, calm, and harmony within the family.',
    gender: 'Male',
    origin: 'Southern African',
    language: 'Xhosa',
    pronunciation: 'kho-LAH-nee'
  },
  {
    id: 'bn-ximena',
    name: 'Ximena',
    meaning: 'One who hears and listens with wisdom',
    significance: 'Classic Spanish and Basque-rooted name representing empathy, attentiveness, and strength.',
    gender: 'Female',
    origin: 'European',
    language: 'Spanish',
    pronunciation: 'hee-MEH-nah'
  },

  // Y
  {
    id: 'bn-yewande',
    name: 'Yewande',
    meaning: 'Mother has returned to bless us',
    significance: 'A traditional Yoruba name honoring ancestral continuity and the enduring love of a grandmother.',
    gender: 'Female',
    origin: 'West African',
    language: 'Yoruba',
    pronunciation: 'yeh-WAHN-day'
  },
  {
    id: 'bn-yara',
    name: 'Yara',
    meaning: 'Small butterfly; lady of the water',
    significance: 'Found in both Arabic (butterfly/warmth) and Indigenous Tupi-Guarani (water lady) traditions.',
    gender: 'Female',
    origin: 'Global',
    language: 'Arabic',
    pronunciation: 'YAH-rah'
  },

  // Z
  {
    id: 'bn-zainab',
    name: 'Zainab',
    meaning: 'Fragrant desert flower; beauty and generosity',
    significance: 'Revered Arabic name symbolizing eloquence, courage, and generosity.',
    gender: 'Female',
    origin: 'Middle Eastern',
    language: 'Arabic',
    pronunciation: 'ZAY-nab'
  },
  {
    id: 'bn-zuri',
    name: 'Zuri',
    meaning: 'Beautiful, good, and pure',
    significance: 'A vibrant Swahili name celebrating inner and outer beauty, kindness, and grace.',
    gender: 'Female',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'ZOO-ree'
  },
  {
    id: 'bn-zuberi',
    name: 'Zuberi',
    meaning: 'Strong, resilient, and powerful',
    significance: 'A Swahili name wishing the child physical vitality and emotional fortitude.',
    gender: 'Male',
    origin: 'East African',
    language: 'Swahili',
    pronunciation: 'zoo-BEH-ree'
  }
];
