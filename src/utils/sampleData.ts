import { TreeDocument } from '../types';

export const FAMILY_TREE_TEMPLATE: TreeDocument = {
  page: {
    size: 'A4',
    orientation: 'landscape',
    margin: 20,
    headerHeight: 50,
    footerHeight: 40,
    headerFit: 'contain',
    footerFit: 'contain',
    headerText: 'THE CHRONICLE OF OUR FAMILY',
    footerText: 'Genealogy Chart — Generated with TreeSketch Pro'
  },
  nodes: [
    { id: 'gp1', label: 'Arthur Pendelton', subLabel: '1912 - 1988', x: 250, y: 30, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'pill' },
    { id: 'gp2', label: 'Eleanor Vance', subLabel: '1918 - 2004', x: 420, y: 30, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'pill' },
    { id: 'p1', label: 'Charles Pendelton', subLabel: 'b. 1944', x: 180, y: 150, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'rectangle' },
    { id: 'p2', label: 'Diana Pendelton', subLabel: 'b. 1948', x: 490, y: 150, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'rectangle' },
    { id: 'c1', label: 'Thomas Pendelton', subLabel: 'b. 1972', x: 100, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
    { id: 'c2', label: 'Sarah Pendelton', subLabel: 'b. 1975', x: 260, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
    { id: 'c3', label: 'Robert Pendelton', subLabel: 'b. 1980', x: 420, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
    { id: 'c4', label: 'Emily Pendelton', subLabel: 'b. 1983', x: 580, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
  ],
  edges: [
    { id: 'e-gp-p1', from: 'gp1', to: 'p1', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-gp-p2', from: 'gp2', to: 'p2', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p1-c1', from: 'p1', to: 'c1', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p1-c2', from: 'p1', to: 'c2', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p2-c3', from: 'p2', to: 'c3', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p2-c4', from: 'p2', to: 'c4', type: 'elbow', strokeWidth: 1.5 },
  ]
};

export const ORG_CHART_TEMPLATE: TreeDocument = {
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: 15,
    headerHeight: 60,
    footerHeight: 40,
    headerFit: 'contain',
    footerFit: 'contain',
    headerText: 'ACME CORP ORGANIZATIONAL MAP',
    footerText: 'Confidential — For Internal Use Only'
  },
  nodes: [
    { id: 'ceo', label: 'Jane Doe', subLabel: 'Chief Executive Officer', x: 220, y: 20, width: 150, height: 50, fontSize: 14, textAlign: 'center', style: 'rectangle' },
    { id: 'vp1', label: 'John Smith', subLabel: 'VP of Engineering', x: 100, y: 140, width: 140, height: 45, fontSize: 12, textAlign: 'center', style: 'rectangle' },
    { id: 'vp2', label: 'Alice Williams', subLabel: 'VP of Product', x: 340, y: 140, width: 140, height: 45, fontSize: 12, textAlign: 'center', style: 'rectangle' },
    { id: 'm1', label: 'Bob Jones', subLabel: 'Engineering Mgr', x: 30, y: 250, width: 120, height: 40, fontSize: 11, textAlign: 'center', style: 'rectangle' },
    { id: 'm2', label: 'Charlie Brown', subLabel: 'QA Mgr', x: 170, y: 250, width: 120, height: 40, fontSize: 11, textAlign: 'center', style: 'rectangle' },
    { id: 'm3', label: 'Daisy Miller', subLabel: 'Design Lead', x: 340, y: 250, width: 120, height: 40, fontSize: 11, textAlign: 'center', style: 'rectangle' },
  ],
  edges: [
    { id: 'e-ceo-vp1', from: 'ceo', to: 'vp1', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-ceo-vp2', from: 'ceo', to: 'vp2', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-vp1-m1', from: 'vp1', to: 'm1', type: 'elbow', strokeWidth: 1.25 },
    { id: 'e-vp1-m2', from: 'vp1', to: 'm2', type: 'elbow', strokeWidth: 1.25 },
    { id: 'e-vp2-m3', from: 'vp2', to: 'm3', type: 'elbow', strokeWidth: 1.25 },
  ]
};

export const BLANK_TEMPLATE: TreeDocument = {
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: 20,
    headerHeight: 40,
    footerHeight: 40,
    headerFit: 'contain',
    footerFit: 'contain',
    headerText: 'NEW RELATION CHART',
    footerText: 'Formulated with TreeSketch'
  },
  nodes: [
    { id: 'node-1', label: 'Start Node', subLabel: 'Double click to edit text', x: 230, y: 100, width: 130, height: 45, fontSize: 13, textAlign: 'center', style: 'rectangle' }
  ],
  edges: []
};

// PERSIAN TEMPLATES
export const FAMILY_TREE_TEMPLATE_FA: TreeDocument = {
  page: {
    size: 'A4',
    orientation: 'landscape',
    margin: 20,
    headerHeight: 50,
    footerHeight: 40,
    headerFit: 'contain',
    footerFit: 'contain',
    headerText: 'شجره‌نامه خانوادگی ما',
    footerText: 'نمودار تبارشناسی — طراحی شده با TreeSketch'
  },
  nodes: [
    { id: 'gp1', label: 'آقای بزرگ خاندان', subLabel: '۱۲۸۸ - ۱۳۷۲', x: 250, y: 30, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'pill' },
    { id: 'gp2', label: 'خانم بزرگ خاندان', subLabel: '۱۲۹۵ - ۱۳۸۴', x: 420, y: 30, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'pill' },
    { id: 'p1', label: 'پدر (پيمان)', subLabel: 'متولد ۱۳۲۴', x: 180, y: 150, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'rectangle' },
    { id: 'p2', label: 'عمه (مهری)', subLabel: 'متولد ۱۳۲۸', x: 490, y: 150, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'rectangle' },
    { id: 'c1', label: 'فرزند اول (مهران)', subLabel: 'متولد ۱۳۵۲', x: 100, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
    { id: 'c2', label: 'فرزند دوم (بهاره)', subLabel: 'متولد ۱۳۵۵', x: 260, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
    { id: 'c3', label: 'فرزند سوم (حامد)', subLabel: 'متولد ۱۳۶۰', x: 420, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
    { id: 'c4', label: 'فرزند چهارم (میترا)', subLabel: 'متولد ۱۳۶۳', x: 580, y: 270, width: 140, height: 45, fontSize: 13, textAlign: 'center', style: 'card' },
  ],
  edges: [
    { id: 'e-gp-p1', from: 'gp1', to: 'p1', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-gp-p2', from: 'gp2', to: 'p2', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p1-c1', from: 'p1', to: 'c1', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p1-c2', from: 'p1', to: 'c2', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p2-c3', from: 'p2', to: 'c3', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-p2-c4', from: 'p2', to: 'c4', type: 'elbow', strokeWidth: 1.5 },
  ]
};

export const ORG_CHART_TEMPLATE_FA: TreeDocument = {
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: 15,
    headerHeight: 60,
    footerHeight: 40,
    headerFit: 'contain',
    footerFit: 'contain',
    headerText: 'نمودار سازمانی شرکت طراحان',
    footerText: 'محرمانه — صرفاً جهت استفاده داخلی شرکت'
  },
  nodes: [
    { id: 'ceo', label: 'مهندس حسینی', subLabel: 'مدیر عامل و رئیس هیئت مدیره', x: 220, y: 20, width: 150, height: 50, fontSize: 14, textAlign: 'center', style: 'rectangle' },
    { id: 'vp1', label: 'مهندس رضایی', subLabel: 'معاونت فنی و توسعه نرم‌افزار', x: 100, y: 140, width: 140, height: 45, fontSize: 12, textAlign: 'center', style: 'rectangle' },
    { id: 'vp2', label: 'خانم علوی', subLabel: 'مدیریت طراح محصول و طراح ارشد', x: 340, y: 140, width: 140, height: 45, fontSize: 12, textAlign: 'center', style: 'rectangle' },
    { id: 'm1', label: 'آقای کاظمی', subLabel: 'برنامه‌نویس توسعه‌دهنده فرانت‌اند', x: 30, y: 250, width: 120, height: 40, fontSize: 11, textAlign: 'center', style: 'rectangle' },
    { id: 'm2', label: 'خانم مرادی', subLabel: 'راهبر ارشد تضمین کیفیت فنی', x: 170, y: 250, width: 120, height: 40, fontSize: 11, textAlign: 'center', style: 'rectangle' },
    { id: 'm3', label: 'آقای سهرابی', subLabel: 'طراح ارشد رابط کاربری و برندینگ', x: 340, y: 250, width: 120, height: 40, fontSize: 11, textAlign: 'center', style: 'rectangle' },
  ],
  edges: [
    { id: 'e-ceo-vp1', from: 'ceo', to: 'vp1', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-ceo-vp2', from: 'ceo', to: 'vp2', type: 'elbow', strokeWidth: 1.5 },
    { id: 'e-vp1-m1', from: 'vp1', to: 'm1', type: 'elbow', strokeWidth: 1.25 },
    { id: 'e-vp1-m2', from: 'vp1', to: 'm2', type: 'elbow', strokeWidth: 1.25 },
    { id: 'e-vp2-m3', from: 'vp2', to: 'm3', type: 'elbow', strokeWidth: 1.25 },
  ]
};

export const BLANK_TEMPLATE_FA: TreeDocument = {
  page: {
    size: 'A4',
    orientation: 'portrait',
    margin: 20,
    headerHeight: 40,
    footerHeight: 40,
    headerFit: 'contain',
    footerFit: 'contain',
    headerText: 'نمودار درختی جدید',
    footerText: 'طراحی شده با TreeSketch'
  },
  nodes: [
    { id: 'node-1', label: 'گره جدید', subLabel: 'دو بار کلیک برای ویرایش متن', x: 230, y: 100, width: 130, height: 45, fontSize: 13, textAlign: 'center', style: 'rectangle' }
  ],
  edges: []
};
