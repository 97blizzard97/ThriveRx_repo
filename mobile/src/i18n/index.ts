export type Locale = 'en' | 'zh' | 'vi';

type MessageKey =
  | 'app.title'
  | 'app.subtitle'
  | 'language.label'
  | 'disclaimer.general'
  | 'nav.search'
  | 'nav.myList'
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
  | 'scan.title'
  | 'scan.hint'
  | 'scan.pickPhoto'
  | 'scan.takePhoto'
  | 'scan.textHintLabel'
  | 'scan.textHintPlaceholder'
  | 'scan.submit'
  | 'scan.scanning'
  | 'scan.error'
  | 'scan.empty'
  | 'scan.extracted'
  | 'scan.confidence'
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
  | 'medications.addSheetTitle'
  | 'medications.editSheetTitle'
  | 'medications.saving'
  | 'medications.saveChanges'
  | 'medications.editError'
  | 'medications.edit'
  | 'medications.remove'
  | 'medications.removeConfirmTitle'
  | 'medications.removeConfirmMessage'
  | 'medications.removeError'
  | 'medications.goToSearch'
  | 'medications.addFromSearch'
  | 'medications.cancel'
  | 'medications.formLabel'
  | 'medications.doseLabel'
  | 'medications.strengthsHint'
  | 'medications.frequencyLabel'
  | 'medications.withFoodLabel'
  | 'medications.withFoodYes'
  | 'medications.withFoodNo'
  | 'medications.withFoodSkip'
  | 'medications.timesLabel'
  | 'medications.timesHint'
  | 'medications.timesPlaceholder'
  | 'medications.timesAdd'
  | 'medications.timesRequired'
  | 'medications.todayTitle'
  | 'medications.todayError'
  | 'medications.haveYouTaken'
  | 'medications.taken'
  | 'medications.skip'
  | 'medications.allTakenToday'
  | 'medications.treeCanGrow'
  | 'medications.form.tablet'
  | 'medications.form.capsule'
  | 'medications.form.liquid'
  | 'medications.form.inhaler'
  | 'medications.freq.od'
  | 'medications.freq.bd'
  | 'medications.freq.tds'
  | 'medications.freq.qds'
  | 'medications.freq.mane'
  | 'medications.freq.nocte'
  | 'medications.freqAbbrev.od'
  | 'medications.freqAbbrev.bd'
  | 'medications.freqAbbrev.tds'
  | 'medications.freqAbbrev.qds'
  | 'medications.freqAbbrev.mane'
  | 'medications.freqAbbrev.nocte'
  | 'world.title'
  | 'world.stubHint'
  | 'world.apiUnknown'
  | 'world.treeCount'
  | 'world.loadError'
  | 'world.retry'
  | 'world.empty'
  | 'world.goToSearch'
  | 'world.goToSearchHint'
  | 'world.growthLead'
  | 'world.growthDays'
  | 'world.tapTreeHint'
  | 'world.colorLegend'
  | 'world.dragHint'
  | 'world.canPressHint'
  | 'world.pressCta'
  | 'world.pressing'
  | 'world.alreadyPressed'
  | 'world.pauseNote'
  | 'world.close'
  | 'world.demo.label'
  | 'world.demo.title'
  | 'world.demo.hint'
  | 'world.demo.daysMark'
  | 'world.demo.apply'
  | 'world.demo.note'
  | 'world.demo.reset'
  | 'world.demo.resetConfirmTitle'
  | 'world.demo.resetConfirmMessage'
  | 'world.demo.resetCancel'
  | 'world.stage.budding'
  | 'world.stage.small'
  | 'world.stage.large'
  | 'world.stage.mature'
  | 'world.species.oak'
  | 'world.species.maple'
  | 'world.species.birch'
  | 'world.species.willow'
  | 'world.species.cedar';

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    'app.title': 'ThriveRx',
    'app.subtitle': 'Clear medicine info · a world that grows with you',
    'language.label': 'Language',
    'disclaimer.general':
      'Not medical advice. For educational and demo use only — always confirm with your doctor or pharmacist.',
    'nav.search': 'Search',
    'nav.myList': 'My list',
    'nav.world': 'World',
    'medications.title': 'Your medicines',
    'medications.myListTitle': 'My list',
    'medications.loading': 'Loading…',
    'medications.count': '{n} on your list',
    'medications.listEmpty':
      'No medicines yet — search the catalog and add one.',
    'medications.listError': 'Could not load your list. Is the backend running?',
    'medications.addedLabel': 'On your list',
    'medications.unknownName': 'Medicine',
    'medications.searchTitle': 'Search',
    'medications.searchPlaceholder': 'Type a few letters… e.g. met, asp',
    'medications.searchButton': 'Search',
    'medications.searchError': 'Search failed. Check the backend is running.',
    'medications.searchEmpty': 'No matches — try another name.',
    'scan.title': 'Scan a script',
    'scan.hint':
      'Photo an Australian printed script or pack label — we read medicine names automatically (with your API key), then match the catalog. You can still type a name if needed.',
    'scan.pickPhoto': 'Choose photo',
    'scan.takePhoto': 'Take photo',
    'scan.textHintLabel': 'Backup: type a name if the photo is unclear',
    'scan.textHintPlaceholder': 'e.g. metformin, Diabex, Ventolin',
    'scan.submit': 'Scan again',
    'scan.scanning': 'Reading script…',
    'scan.error':
      'Scan failed. Check your connection, try again, or type the medicine name below.',
    'scan.empty':
      'No catalog matches — try a clearer photo, or type a generic/brand name.',
    'scan.extracted': 'Read from script',
    'scan.confidence': '{n}% match — tap to review',
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
    'medications.addSheetTitle': 'Add to my list',
    'medications.editSheetTitle': 'Edit medication',
    'medications.saving': 'Saving…',
    'medications.saveChanges': 'Save changes',
    'medications.editError': 'Could not save changes. Try again.',
    'medications.edit': 'Edit',
    'medications.remove': 'Remove',
    'medications.removeConfirmTitle': 'Remove medication?',
    'medications.removeConfirmMessage':
      'Remove {name} from your list? This cannot be undone.',
    'medications.removeError': 'Could not remove that medication. Try again.',
    'medications.goToSearch': 'Search catalog',
    'medications.addFromSearch': '+ Add medicine',
    'medications.cancel': 'Cancel',
    'medications.formLabel': 'Form',
    'medications.doseLabel': 'Dose',
    'medications.strengthsHint':
      'Common pack strengths (demo only — not prescribing advice).',
    'medications.frequencyLabel': 'How often',
    'medications.withFoodLabel': 'With food?',
    'medications.withFoodYes': 'Yes',
    'medications.withFoodNo': 'No',
    'medications.withFoodSkip': 'Not sure',
    'medications.timesLabel': 'Usual times',
    'medications.timesHint':
      'Suggestions from how often you take it — tap to choose, or type HH:MM. Schedule prompts only.',
    'medications.timesPlaceholder': 'HH:MM',
    'medications.timesAdd': 'Add',
    'medications.timesRequired': 'Add at least one time.',
    'medications.todayTitle': 'Today',
    'medications.todayError': 'Could not load today’s doses.',
    'medications.haveYouTaken': 'Have you taken {name}?',
    'medications.taken': 'Taken',
    'medications.skip': 'Skip',
    'medications.allTakenToday': 'All of today’s times marked Taken.',
    'medications.treeCanGrow': 'Your tree can grow today.',
    'medications.form.tablet': 'Tablet',
    'medications.form.capsule': 'Capsule',
    'medications.form.liquid': 'Liquid',
    'medications.form.inhaler': 'Inhaler',
    'medications.freq.od': 'Once daily',
    'medications.freq.bd': 'Twice daily',
    'medications.freq.tds': 'Three times daily',
    'medications.freq.qds': 'Four times daily',
    'medications.freq.mane': 'Morning',
    'medications.freq.nocte': 'Night',
    'medications.freqAbbrev.od': 'OD',
    'medications.freqAbbrev.bd': 'BD',
    'medications.freqAbbrev.tds': 'TDS',
    'medications.freqAbbrev.qds': 'QDS',
    'medications.freqAbbrev.mane': 'mane',
    'medications.freqAbbrev.nocte': 'nocte',
    'world.title': 'Your world',
    'world.stubHint':
      'Trees and daily press live here (world module). Growth pauses, never punishes.',
    'world.apiUnknown': 'Could not load world (is the backend running?)',
    'world.treeCount': '{n} trees',
    'world.loadError': 'Could not load your world. Is the backend running?',
    'world.retry': 'Try again',
    'world.empty':
      'Add a medicine on Search to plant your first tree.',
    'world.goToSearch': 'Go to Search',
    'world.goToSearchHint': 'Open the Search tab to add a medicine.',
    'world.growthLead': '{n} trees growing here',
    'world.growthDays': '{n} days grown',
    'world.tapTreeHint': 'Tap a tree to see how it is growing',
    'world.colorLegend': 'Each colour is a medicine',
    'world.dragHint': 'Drag to turn your little planet',
    'world.canPressHint':
      'You can check in here today — or mark Taken on My list.',
    'world.pressCta': "I'm here today",
    'world.pressing': 'Growing…',
    'world.alreadyPressed': 'Already grown today — see you tomorrow.',
    'world.pauseNote':
      'Missed days only pause growth time. Your tree never shrinks or wilts.',
    'world.close': 'Close',
    'world.demo.label': 'Demo',
    'world.demo.title': 'Fast-forward garden',
    'world.demo.hint': 'Simulate growth days for the portfolio demo.',
    'world.demo.daysMark': '{n} days',
    'world.demo.apply': 'Add {n} days to every tree',
    'world.demo.note':
      'Real growth comes from daily Taken or “I’m here today” — this control is demo-only.',
    'world.demo.reset': 'Reset garden',
    'world.demo.resetConfirmTitle': 'Reset garden?',
    'world.demo.resetConfirmMessage':
      'All trees return to budding with 0 growth days. Species stay the same. Demo only.',
    'world.demo.resetCancel': 'Cancel',
    'world.stage.budding': 'Stage: budding',
    'world.stage.small': 'Stage: small',
    'world.stage.large': 'Stage: large',
    'world.stage.mature': 'Stage: mature',
    'world.species.oak': 'Oak',
    'world.species.maple': 'Maple',
    'world.species.birch': 'Birch',
    'world.species.willow': 'Willow',
    'world.species.cedar': 'Cedar',
  },
  zh: {
    'app.title': 'ThriveRx',
    'app.subtitle': '易懂用药说明 · 随你一同成长的世界',
    'language.label': '语言',
    'disclaimer.general':
      '非医疗建议，仅供教育与演示用途 — 请务必向医生或药剂师确认。',
    'nav.search': '搜索',
    'nav.myList': '我的清单',
    'nav.world': '世界',
    'medications.title': '您的药物',
    'medications.myListTitle': '我的清单',
    'medications.loading': '加载中…',
    'medications.count': '清单上 {n} 种',
    'medications.listEmpty': '暂无药物 — 请在搜索页添加。',
    'medications.listError': '无法加载清单。后端是否已启动？',
    'medications.addedLabel': '已在清单中',
    'medications.unknownName': '药物',
    'medications.searchTitle': '搜索',
    'medications.searchPlaceholder': '输入几个字母… 如 met、阿莫',
    'medications.searchButton': '搜索',
    'medications.searchError': '搜索失败。请检查后端是否运行。',
    'medications.searchEmpty': '无匹配结果 — 请尝试其他名称。',
    'scan.title': '扫描处方',
    'scan.hint':
      '拍摄澳大利亚打印处方或药盒 — 配置 API 密钥后会自动识别药名并匹配目录。不清时可手动输入。',
    'scan.pickPhoto': '选择照片',
    'scan.takePhoto': '拍照',
    'scan.textHintLabel': '备用：照片不清时输入药名',
    'scan.textHintPlaceholder': '例如 metformin、Diabex、Ventolin',
    'scan.submit': '重新扫描',
    'scan.scanning': '正在识别处方…',
    'scan.error': '扫描失败。请检查网络后重试，或在下方输入药名。',
    'scan.empty': '目录无匹配 — 换更清晰的照片，或输入通用名/品牌名。',
    'scan.extracted': '从处方识别',
    'scan.confidence': '{n}% 匹配 — 点按查看',
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
    'medications.addSheetTitle': '添加到我的清单',
    'medications.editSheetTitle': '编辑药物',
    'medications.saving': '保存中…',
    'medications.saveChanges': '保存更改',
    'medications.editError': '无法保存更改。请重试。',
    'medications.edit': '编辑',
    'medications.remove': '移除',
    'medications.removeConfirmTitle': '移除药物？',
    'medications.removeConfirmMessage': '从清单中移除 {name}？此操作无法撤销。',
    'medications.removeError': '无法移除该药物。请重试。',
    'medications.goToSearch': '搜索目录',
    'medications.addFromSearch': '+ 添加药物',
    'medications.cancel': '取消',
    'medications.formLabel': '剂型',
    'medications.doseLabel': '剂量',
    'medications.strengthsHint': '常见规格（演示用 — 非处方建议）。',
    'medications.frequencyLabel': '服用频率',
    'medications.withFoodLabel': '是否随餐？',
    'medications.withFoodYes': '是',
    'medications.withFoodNo': '否',
    'medications.withFoodSkip': '不确定',
    'medications.timesLabel': '服用时间',
    'medications.timesHint':
      '根据服用频率提供建议 — 点选或输入 HH:MM。仅为日程提醒。',
    'medications.timesPlaceholder': 'HH:MM',
    'medications.timesAdd': '添加',
    'medications.timesRequired': '请至少添加一个时间。',
    'medications.todayTitle': '今天',
    'medications.todayError': '无法加载今日服用记录。',
    'medications.haveYouTaken': '您服过 {name} 了吗？',
    'medications.taken': '已服用',
    'medications.skip': '跳过',
    'medications.allTakenToday': '今天的时间均已标记为已服用。',
    'medications.treeCanGrow': '您的树今天可以成长。',
    'medications.form.tablet': '片剂',
    'medications.form.capsule': '胶囊',
    'medications.form.liquid': '液体',
    'medications.form.inhaler': '吸入剂',
    'medications.freq.od': '每日一次',
    'medications.freq.bd': '每日两次',
    'medications.freq.tds': '每日三次',
    'medications.freq.qds': '每日四次',
    'medications.freq.mane': '早晨',
    'medications.freq.nocte': '夜间',
    'medications.freqAbbrev.od': 'OD',
    'medications.freqAbbrev.bd': 'BD',
    'medications.freqAbbrev.tds': 'TDS',
    'medications.freqAbbrev.qds': 'QDS',
    'medications.freqAbbrev.mane': 'mane',
    'medications.freqAbbrev.nocte': 'nocte',
    'world.title': '您的世界',
    'world.stubHint': '树木与每日确认（世界模块）。生长会暂停，不会惩罚。',
    'world.apiUnknown': '无法加载世界（后端是否已启动？）',
    'world.treeCount': '{n} 棵树',
    'world.loadError': '无法加载世界。后端是否已启动？',
    'world.retry': '重试',
    'world.empty': '在搜索页添加药物，种下第一棵树。',
    'world.goToSearch': '前往搜索',
    'world.goToSearchHint': '打开搜索标签页添加药物。',
    'world.growthLead': '这里有 {n} 棵树在生长',
    'world.growthDays': '已生长 {n} 天',
    'world.tapTreeHint': '点按树木查看生长情况',
    'world.colorLegend': '每种颜色代表一种药物',
    'world.dragHint': '拖动旋转你的小星球',
    'world.canPressHint': '今天可以在此签到 — 或在「我的清单」标记已服用。',
    'world.pressCta': '我今天来了',
    'world.pressing': '生长中…',
    'world.alreadyPressed': '今天已成长 — 明天见。',
    'world.pauseNote': '错过的日子只会暂停生长时间。树木不会缩小或枯萎。',
    'world.close': '关闭',
    'world.demo.label': '演示',
    'world.demo.title': '快进花园',
    'world.demo.hint': '为作品集演示模拟生长天数。',
    'world.demo.daysMark': '{n} 天',
    'world.demo.apply': '为每棵树增加 {n} 天',
    'world.demo.note':
      '真实生长来自每日「已服用」或「我今天来了」— 此控件仅用于演示。',
    'world.demo.reset': '重置花园',
    'world.demo.resetConfirmTitle': '重置花园？',
    'world.demo.resetConfirmMessage':
      '所有树木将回到萌芽、生长天数为 0。树种保持不变。仅用于演示。',
    'world.demo.resetCancel': '取消',
    'world.stage.budding': '阶段：萌芽',
    'world.stage.small': '阶段：幼树',
    'world.stage.large': '阶段：大树',
    'world.stage.mature': '阶段：成熟',
    'world.species.oak': '橡树',
    'world.species.maple': '枫树',
    'world.species.birch': '桦树',
    'world.species.willow': '柳树',
    'world.species.cedar': '雪松',
  },
  vi: {
    'app.title': 'ThriveRx',
    'app.subtitle': 'Thông tin thuốc rõ ràng · thế giới lớn cùng bạn',
    'language.label': 'Ngôn ngữ',
    'disclaimer.general':
      'Không phải lời khuyên y tế. Chỉ dùng cho mục đích giáo dục và demo — luôn xác nhận với bác sĩ hoặc dược sĩ.',
    'nav.search': 'Tìm kiếm',
    'nav.myList': 'Danh sách',
    'nav.world': 'Thế giới',
    'medications.title': 'Thuốc của bạn',
    'medications.myListTitle': 'Danh sách của tôi',
    'medications.loading': 'Đang tải…',
    'medications.count': '{n} trong danh sách',
    'medications.listEmpty':
      'Chưa có thuốc — tìm trong danh mục và thêm vào.',
    'medications.listError':
      'Không tải được danh sách. Backend đã chạy chưa?',
    'medications.addedLabel': 'Trong danh sách',
    'medications.unknownName': 'Thuốc',
    'medications.searchTitle': 'Tìm kiếm',
    'medications.searchPlaceholder': 'Gõ vài chữ… vd. met, asp',
    'medications.searchButton': 'Tìm',
    'medications.searchError': 'Tìm kiếm thất bại. Kiểm tra backend.',
    'medications.searchEmpty': 'Không có kết quả — thử tên khác.',
    'scan.title': 'Quét đơn thuốc',
    'scan.hint':
      'Chụp đơn in kiểu Úc hoặc nhãn thuốc — có API key sẽ tự đọc tên thuốc rồi khớp danh mục. Có thể gõ thêm nếu ảnh mờ.',
    'scan.pickPhoto': 'Chọn ảnh',
    'scan.takePhoto': 'Chụp ảnh',
    'scan.textHintLabel': 'Dự phòng: gõ tên nếu ảnh không rõ',
    'scan.textHintPlaceholder': 'vd. metformin, Diabex, Ventolin',
    'scan.submit': 'Quét lại',
    'scan.scanning': 'Đang đọc đơn…',
    'scan.error':
      'Quét thất bại. Kiểm tra kết nối, thử lại, hoặc gõ tên thuốc bên dưới.',
    'scan.empty':
      'Không khớp danh mục — thử ảnh rõ hơn, hoặc gõ tên gốc/biệt dược.',
    'scan.extracted': 'Đọc từ đơn',
    'scan.confidence': '{n}% khớp — chạm để xem',
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
    'medications.addSheetTitle': 'Thêm vào danh sách',
    'medications.editSheetTitle': 'Sửa thuốc',
    'medications.saving': 'Đang lưu…',
    'medications.saveChanges': 'Lưu thay đổi',
    'medications.editError': 'Không lưu được. Thử lại.',
    'medications.edit': 'Sửa',
    'medications.remove': 'Xóa',
    'medications.removeConfirmTitle': 'Xóa thuốc?',
    'medications.removeConfirmMessage':
      'Xóa {name} khỏi danh sách? Không thể hoàn tác.',
    'medications.removeError': 'Không xóa được thuốc. Thử lại.',
    'medications.goToSearch': 'Tìm trong danh mục',
    'medications.addFromSearch': '+ Thêm thuốc',
    'medications.cancel': 'Hủy',
    'medications.formLabel': 'Dạng thuốc',
    'medications.doseLabel': 'Liều',
    'medications.strengthsHint':
      'Hàm lượng phổ biến (chỉ demo — không phải chỉ định).',
    'medications.frequencyLabel': 'Tần suất',
    'medications.withFoodLabel': 'Uống với thức ăn?',
    'medications.withFoodYes': 'Có',
    'medications.withFoodNo': 'Không',
    'medications.withFoodSkip': 'Không chắc',
    'medications.timesLabel': 'Giờ uống',
    'medications.timesHint':
      'Gợi ý theo tần suất — chạm để chọn, hoặc gõ HH:MM. Chỉ là nhắc lịch.',
    'medications.timesPlaceholder': 'HH:MM',
    'medications.timesAdd': 'Thêm',
    'medications.timesRequired': 'Thêm ít nhất một giờ.',
    'medications.todayTitle': 'Hôm nay',
    'medications.todayError': 'Không tải được liều hôm nay.',
    'medications.haveYouTaken': 'Bạn đã uống {name} chưa?',
    'medications.taken': 'Đã uống',
    'medications.skip': 'Bỏ qua',
    'medications.allTakenToday': 'Đã đánh dấu Đã uống cho mọi giờ hôm nay.',
    'medications.treeCanGrow': 'Cây của bạn có thể lớn hôm nay.',
    'medications.form.tablet': 'Viên nén',
    'medications.form.capsule': 'Viên nang',
    'medications.form.liquid': 'Dung dịch',
    'medications.form.inhaler': 'Ống hít',
    'medications.freq.od': 'Một lần mỗi ngày',
    'medications.freq.bd': 'Hai lần mỗi ngày',
    'medications.freq.tds': 'Ba lần mỗi ngày',
    'medications.freq.qds': 'Bốn lần mỗi ngày',
    'medications.freq.mane': 'Buổi sáng',
    'medications.freq.nocte': 'Buổi tối',
    'medications.freqAbbrev.od': 'OD',
    'medications.freqAbbrev.bd': 'BD',
    'medications.freqAbbrev.tds': 'TDS',
    'medications.freqAbbrev.qds': 'QDS',
    'medications.freqAbbrev.mane': 'mane',
    'medications.freqAbbrev.nocte': 'nocte',
    'world.title': 'Thế giới của bạn',
    'world.stubHint':
      'Cây và xác nhận hàng ngày (module thế giới). Tăng trưởng tạm dừng, không phạt.',
    'world.apiUnknown': 'Không tải được thế giới (backend đã chạy chưa?)',
    'world.treeCount': '{n} cây',
    'world.loadError': 'Không tải được thế giới. Backend đã chạy chưa?',
    'world.retry': 'Thử lại',
    'world.empty': 'Thêm thuốc ở Tìm kiếm để trồng cây đầu tiên.',
    'world.goToSearch': 'Đến Tìm kiếm',
    'world.goToSearchHint': 'Mở tab Tìm kiếm để thêm thuốc.',
    'world.growthLead': '{n} cây đang lớn ở đây',
    'world.growthDays': 'Đã lớn {n} ngày',
    'world.tapTreeHint': 'Chạm vào cây để xem sự phát triển',
    'world.colorLegend': 'Mỗi màu là một loại thuốc',
    'world.dragHint': 'Kéo để xoay hành tinh nhỏ',
    'world.canPressHint':
      'Bạn có thể điểm danh ở đây hôm nay — hoặc đánh dấu Đã uống ở Danh sách.',
    'world.pressCta': 'Tôi ở đây hôm nay',
    'world.pressing': 'Đang lớn…',
    'world.alreadyPressed': 'Hôm nay đã lớn rồi — hẹn ngày mai.',
    'world.pauseNote':
      'Ngày bỏ lỡ chỉ tạm dừng thời gian lớn. Cây không bao giờ teo hay héo.',
    'world.close': 'Đóng',
    'world.demo.label': 'Demo',
    'world.demo.title': 'Tua nhanh khu vườn',
    'world.demo.hint': 'Mô phỏng ngày tăng trưởng cho bản demo portfolio.',
    'world.demo.daysMark': '{n} ngày',
    'world.demo.apply': 'Thêm {n} ngày cho mọi cây',
    'world.demo.note':
      'Tăng trưởng thật đến từ Đã uống hàng ngày hoặc “Tôi ở đây hôm nay” — điều khiển này chỉ dùng demo.',
    'world.demo.reset': 'Đặt lại khu vườn',
    'world.demo.resetConfirmTitle': 'Đặt lại khu vườn?',
    'world.demo.resetConfirmMessage':
      'Mọi cây trở về nảy mầm với 0 ngày tăng trưởng. Loài cây giữ nguyên. Chỉ dùng demo.',
    'world.demo.resetCancel': 'Hủy',
    'world.stage.budding': 'Giai đoạn: nảy mầm',
    'world.stage.small': 'Giai đoạn: nhỏ',
    'world.stage.large': 'Giai đoạn: lớn',
    'world.stage.mature': 'Giai đoạn: trưởng thành',
    'world.species.oak': 'Sồi',
    'world.species.maple': 'Phong',
    'world.species.birch': 'Bạch dương',
    'world.species.willow': 'Liễu',
    'world.species.cedar': 'Tuyết tùng',
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
