export type Locale = 'en' | 'zh' | 'vi';

type MessageKey =
  | 'app.title'
  | 'disclaimer.general'
  | 'nav.medications'
  | 'nav.world'
  | 'medications.title'
  | 'medications.stubHint'
  | 'medications.loading'
  | 'medications.count'
  | 'world.title'
  | 'world.stubHint'
  | 'world.apiUnknown'
  | 'world.treeCount';

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    'app.title': 'ThriveRx',
    'disclaimer.general':
      'General information only — always confirm with your doctor or pharmacist.',
    'nav.medications': 'Medicines',
    'nav.world': 'World',
    'medications.title': 'Your medicines',
    'medications.stubHint':
      'Search, scan, list, and reminders live here (med core module).',
    'medications.loading': 'Loading…',
    'medications.count': '{n} on your list',
    'world.title': 'Your world',
    'world.stubHint':
      'Trees and daily press live here (world module). Growth pauses, never punishes.',
    'world.apiUnknown': 'Could not load world (is the backend running?)',
    'world.treeCount': '{n} trees',
  },
  zh: {
    'app.title': 'ThriveRx',
    'disclaimer.general': '仅供参考 — 请务必向医生或药剂师确认。',
    'nav.medications': '药物',
    'nav.world': '世界',
    'medications.title': '您的药物',
    'medications.stubHint': '搜索、扫描、清单与提醒（药物模块）。',
    'medications.loading': '加载中…',
    'medications.count': '清单上 {n} 种',
    'world.title': '您的世界',
    'world.stubHint': '树木与每日确认（世界模块）。生长会暂停，不会惩罚。',
    'world.apiUnknown': '无法加载世界（后端是否已启动？）',
    'world.treeCount': '{n} 棵树',
  },
  vi: {
    'app.title': 'ThriveRx',
    'disclaimer.general':
      'Chỉ mang tính tham khảo — luôn xác nhận với bác sĩ hoặc dược sĩ.',
    'nav.medications': 'Thuốc',
    'nav.world': 'Thế giới',
    'medications.title': 'Thuốc của bạn',
    'medications.stubHint':
      'Tìm kiếm, quét, danh sách và nhắc nhở (module thuốc).',
    'medications.loading': 'Đang tải…',
    'medications.count': '{n} trong danh sách',
    'world.title': 'Thế giới của bạn',
    'world.stubHint':
      'Cây và xác nhận hàng ngày (module thế giới). Tăng trưởng tạm dừng, không phạt.',
    'world.apiUnknown': 'Không tải được thế giới (backend đã chạy chưa?)',
    'world.treeCount': '{n} cây',
  },
};

export function t(
  key: MessageKey,
  locale: Locale = 'en',
  substitution?: number,
): string {
  let text = messages[locale][key];
  if (substitution !== undefined) {
    text = text.replace('{n}', String(substitution));
  }
  return text;
}
