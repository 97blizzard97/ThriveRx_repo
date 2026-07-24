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
  | 'world.apiUnknown'
  | 'world.loading'
  | 'world.empty'
  | 'world.rotateHint'
  | 'world.growingHint'
  | 'world.treeGrowingHint'
  | 'world.matureHint'
  | 'world.close'
  | 'world.stage.budding'
  | 'world.stage.small'
  | 'world.stage.large'
  | 'world.stage.mature'
  | 'world.species.oak'
  | 'world.species.maple'
  | 'world.species.birch'
  | 'world.species.willow'
  | 'world.species.cedar'
  | 'world.press.button'
  | 'world.press.pressing'
  | 'world.press.done'
  | 'world.press.error';

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
    'world.apiUnknown': 'Could not load world (is the backend running?)',
    'world.loading': 'Loading your world…',
    'world.empty':
      'Your world is waiting — add a medicine to plant its first tree.',
    'world.rotateHint': 'Drag to rotate your world. Tap a tree for details.',
    'world.growingHint': 'Your world is growing.',
    'world.treeGrowingHint':
      'This tree grows a little with every day you confirm — a missed day just pauses it, never undoes it.',
    'world.matureHint':
      'Fully grown. Every day you keep confirming, your world keeps growing around it.',
    'world.close': 'Close',
    'world.stage.budding': 'Budding',
    'world.stage.small': 'Small tree',
    'world.stage.large': 'Large tree',
    'world.stage.mature': 'Mature tree',
    'world.species.oak': 'Oak',
    'world.species.maple': 'Maple',
    'world.species.birch': 'Birch',
    'world.species.willow': 'Willow',
    'world.species.cedar': 'Cedar',
    'world.press.button': 'I took this today',
    'world.press.pressing': 'Saving…',
    'world.press.done': 'Confirmed for today',
    'world.press.error': 'Could not save — check the backend and try again.',
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
    'world.apiUnknown': '无法加载世界（后端是否已启动？）',
    'world.loading': '正在加载您的世界…',
    'world.empty': '您的世界还是空的 — 添加一种药物即可种下第一棵树。',
    'world.rotateHint': '拖动可旋转您的世界。点击树木查看详情。',
    'world.growingHint': '您的世界在成长。',
    'world.treeGrowingHint':
      '每次确认服药，这棵树都会慢慢长大 — 漏掉一天只会暂停生长，绝不会消退。',
    'world.matureHint': '已长成。只要持续确认，您的世界会在它周围继续成长。',
    'world.close': '关闭',
    'world.stage.budding': '萌芽期',
    'world.stage.small': '小树',
    'world.stage.large': '大树',
    'world.stage.mature': '成熟树',
    'world.species.oak': '橡树',
    'world.species.maple': '枫树',
    'world.species.birch': '白桦树',
    'world.species.willow': '柳树',
    'world.species.cedar': '雪松',
    'world.press.button': '我今天已服药',
    'world.press.pressing': '保存中…',
    'world.press.done': '今天已确认',
    'world.press.error': '保存失败 — 请检查后端后重试。',
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
    'world.apiUnknown': 'Không tải được thế giới (backend đã chạy chưa?)',
    'world.loading': 'Đang tải thế giới của bạn…',
    'world.empty':
      'Thế giới của bạn đang chờ — thêm một loại thuốc để trồng cây đầu tiên.',
    'world.rotateHint':
      'Kéo để xoay thế giới của bạn. Chạm vào cây để xem chi tiết.',
    'world.growingHint': 'Thế giới của bạn đang lớn lên.',
    'world.treeGrowingHint':
      'Cây này lớn dần theo mỗi lần bạn xác nhận — bỏ lỡ một ngày chỉ tạm dừng, không bao giờ mất đi.',
    'world.matureHint':
      'Đã trưởng thành. Bạn tiếp tục xác nhận, thế giới sẽ tiếp tục lớn lên xung quanh cây này.',
    'world.close': 'Đóng',
    'world.stage.budding': 'Đang nảy mầm',
    'world.stage.small': 'Cây nhỏ',
    'world.stage.large': 'Cây lớn',
    'world.stage.mature': 'Cây trưởng thành',
    'world.species.oak': 'Cây sồi',
    'world.species.maple': 'Cây phong',
    'world.species.birch': 'Cây bạch dương',
    'world.species.willow': 'Cây liễu',
    'world.species.cedar': 'Cây tuyết tùng',
    'world.press.button': 'Tôi đã uống thuốc hôm nay',
    'world.press.pressing': 'Đang lưu…',
    'world.press.done': 'Đã xác nhận hôm nay',
    'world.press.error': 'Không lưu được — kiểm tra backend và thử lại.',
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
