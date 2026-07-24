export type Locale = 'en' | 'zh' | 'vi';

type MessageKey =
  | 'app.title'
  | 'disclaimer.general'
  | 'nav.medications'
  | 'nav.world'
  | 'medications.title'
  | 'medications.myListTitle'
  | 'medications.loading'
  | 'medications.count'
  | 'medications.listEmpty'
  | 'medications.listError'
  | 'medications.addedLabel'
  | 'medications.unknownName'
  | 'medications.searchTitle'
  | 'medications.searchPlaceholder'
  | 'medications.searchButton'
  | 'medications.searchError'
  | 'medications.searchEmpty'
  | 'medications.tapForDetail'
  | 'medications.back'
  | 'medications.detailError'
  | 'medications.translationNote'
  | 'medications.whatFor'
  | 'medications.howTaken'
  | 'medications.sideEffects'
  | 'medications.pharmacistIf'
  | 'medications.addToList'
  | 'medications.adding'
  | 'medications.addError'
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
    'medications.myListTitle': 'On your list',
    'medications.loading': 'Loading…',
    'medications.count': '{n} on your list',
    'medications.listEmpty':
      'No medicines yet — search below and add one to your list.',
    'medications.listError': 'Could not load your list. Is the backend running?',
    'medications.addedLabel': 'On your list',
    'medications.unknownName': 'Medicine',
    'medications.searchTitle': 'Search catalog',
    'medications.searchPlaceholder': 'e.g. metformin, paracetamol',
    'medications.searchButton': 'Search',
    'medications.searchError': 'Search failed. Check the backend is running.',
    'medications.searchEmpty': 'No matches — try another name.',
    'medications.tapForDetail': 'Tap for plain-language info',
    'medications.back': '← Back',
    'medications.detailError': 'Could not load medicine details.',
    'medications.translationNote':
      'Demo translation — not medically reviewed.',
    'medications.whatFor': 'What it is for',
    'medications.howTaken': 'How it is usually taken',
    'medications.sideEffects': 'Common side effects',
    'medications.pharmacistIf': 'Check with your pharmacist if',
    'medications.addToList': 'Add to my list',
    'medications.adding': 'Adding…',
    'medications.addError': 'Could not add — it may already be on your list.',
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
    'medications.myListTitle': '您的清单',
    'medications.loading': '加载中…',
    'medications.count': '清单上 {n} 种',
    'medications.listEmpty': '暂无药物 — 请在下方搜索并添加。',
    'medications.listError': '无法加载清单。后端是否已启动？',
    'medications.addedLabel': '已在清单中',
    'medications.unknownName': '药物',
    'medications.searchTitle': '搜索药品目录',
    'medications.searchPlaceholder': '例如 metformin、扑热息痛',
    'medications.searchButton': '搜索',
    'medications.searchError': '搜索失败。请检查后端是否运行。',
    'medications.searchEmpty': '无匹配结果 — 请尝试其他名称。',
    'medications.tapForDetail': '点击查看通俗说明',
    'medications.back': '← 返回',
    'medications.detailError': '无法加载药物详情。',
    'medications.translationNote': '演示译文 — 未经医学审核。',
    'medications.whatFor': '用途',
    'medications.howTaken': '通常如何服用',
    'medications.sideEffects': '常见副作用',
    'medications.pharmacistIf': '以下情况请咨询药剂师',
    'medications.addToList': '添加到我的清单',
    'medications.adding': '添加中…',
    'medications.addError': '无法添加 — 可能已在清单中。',
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
    'medications.myListTitle': 'Trong danh sách',
    'medications.loading': 'Đang tải…',
    'medications.count': '{n} trong danh sách',
    'medications.listEmpty':
      'Chưa có thuốc — tìm kiếm bên dưới và thêm vào danh sách.',
    'medications.listError':
      'Không tải được danh sách. Backend đã chạy chưa?',
    'medications.addedLabel': 'Trong danh sách',
    'medications.unknownName': 'Thuốc',
    'medications.searchTitle': 'Tìm trong danh mục',
    'medications.searchPlaceholder': 'vd. metformin, paracetamol',
    'medications.searchButton': 'Tìm',
    'medications.searchError': 'Tìm kiếm thất bại. Kiểm tra backend.',
    'medications.searchEmpty': 'Không có kết quả — thử tên khác.',
    'medications.tapForDetail': 'Chạm để xem thông tin dễ hiểu',
    'medications.back': '← Quay lại',
    'medications.detailError': 'Không tải được chi tiết thuốc.',
    'medications.translationNote':
      'Bản dịch demo — chưa được duyệt y khoa.',
    'medications.whatFor': 'Dùng để làm gì',
    'medications.howTaken': 'Thường uống/dùng như thế nào',
    'medications.sideEffects': 'Tác dụng phụ thường gặp',
    'medications.pharmacistIf': 'Hỏi dược sĩ nếu',
    'medications.addToList': 'Thêm vào danh sách',
    'medications.adding': 'Đang thêm…',
    'medications.addError': 'Không thêm được — có thể đã có trong danh sách.',
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
