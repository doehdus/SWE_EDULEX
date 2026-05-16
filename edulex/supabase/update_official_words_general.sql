-- ================================================================
-- official_words 테이블의 general_meaning / general_example NULL 값 채우기
-- Supabase SQL Editor에서 실행
-- ================================================================

-- ----------------------------------------------------------------
-- 컴퓨터과학과
-- ----------------------------------------------------------------
UPDATE public.official_words SET
  general_meaning = '해시 테이블',
  general_example = 'A hash table can store and retrieve data very quickly.'
WHERE english = 'Hash Table'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '운영 체제',
  general_example = 'The operating system manages all the programs on your computer.'
WHERE english = 'Operating System'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '교착 상태, 막힌 상황',
  general_example = 'The negotiation ended in a deadlock with no agreement reached.'
WHERE english = 'Deadlock'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '가상 메모리',
  general_example = 'Virtual memory lets your computer handle more tasks than the RAM alone allows.'
WHERE english = 'Virtual Memory'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '응용 프로그램 인터페이스',
  general_example = 'The weather app uses an API to fetch real-time data.'
WHERE english = 'API'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '구조적 질의 언어',
  general_example = 'You can use SQL to search and organize data stored in a database.'
WHERE english = 'SQL'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '정규화, 표준화',
  general_example = 'Normalization of test scores makes it easier to compare results fairly.'
WHERE english = 'Normalization'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '기계 학습',
  general_example = 'Machine learning helps apps like music players suggest songs you might enjoy.'
WHERE english = 'Machine Learning'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '신경망',
  general_example = 'A neural network can recognize handwritten letters like a human brain.'
WHERE english = 'Neural Network'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '과적합, 지나친 최적화',
  general_example = 'If you only study past exam questions, you risk overfitting and failing new ones.'
WHERE english = 'Overfitting'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '버전 관리',
  general_example = 'Version control lets you go back to an earlier draft of your document.'
WHERE english = 'Version Control'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '리팩토링, 재정비',
  general_example = 'She spent the weekend refactoring her essay to make it clearer.'
WHERE english = 'Refactoring'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '설계 패턴, 디자인 패턴',
  general_example = 'Following a design pattern for the room layout made decorating much easier.'
WHERE english = 'Design Pattern'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '의존성 주입',
  general_example = 'Dependency injection in cooking means adding ingredients at the right stage of the recipe.'
WHERE english = 'Dependency Injection'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '처리량, 생산량',
  general_example = 'The factory increased its throughput by adding an extra shift.'
WHERE english = 'Throughput'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '부하 분산',
  general_example = 'Good load balancing at the event meant no single entrance got too crowded.'
WHERE english = 'Load Balancing'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '마이크로서비스',
  general_example = 'The company restructured into microservices, each team handling one small product.'
WHERE english = 'Microservice'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '방화벽',
  general_example = 'A firewall around the building prevented unauthorized access.'
WHERE english = 'Firewall'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '가비지 컬렉션, 쓰레기 수거',
  general_example = 'Garbage collection in the city keeps the streets clean automatically.'
WHERE english = 'Garbage Collection'
  AND wordbook_id = 'a1000000-0000-0000-0000-000000000001'
  AND (general_meaning IS NULL OR general_example IS NULL);

-- ----------------------------------------------------------------
-- 경영학과
-- ----------------------------------------------------------------
UPDATE public.official_words SET
  general_meaning = '이해관계자, 관련자',
  general_example = 'Every stakeholder in the project had a different opinion about the deadline.'
WHERE english = 'Stakeholder'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '공급망, 공급 체계',
  general_example = 'The supply chain for this product spans three different continents.'
WHERE english = 'Supply Chain'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '시장 세분화',
  general_example = 'Market segmentation helped the team focus on the right customer groups.'
WHERE english = 'Market Segmentation'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '경쟁 우위',
  general_example = 'Her competitive advantage at the race was her speed off the starting line.'
WHERE english = 'Competitive Advantage'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '현금 흐름',
  general_example = 'Managing your cash flow means knowing when money comes in and goes out.'
WHERE english = 'Cash Flow'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '감가상각, 가치 하락',
  general_example = 'The car depreciation meant it was worth much less after three years.'
WHERE english = 'Depreciation'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '이익률',
  general_example = 'A high profit margin means you keep more of each dollar you earn.'
WHERE english = 'Profit Margin'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '재무상태표',
  general_example = 'The balance sheet showed the family''s total assets and debts at year end.'
WHERE english = 'Balance Sheet'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '손익계산서',
  general_example = 'The income statement revealed the business had earned a profit last quarter.'
WHERE english = 'Income Statement'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '변동비',
  general_example = 'Your phone bill is a variable cost because it changes based on usage.'
WHERE english = 'Variable Cost'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '손익분기점',
  general_example = 'She needed to sell 100 tickets to reach the break-even point for the event.'
WHERE english = 'Break-even Point'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '규모의 경제',
  general_example = 'Buying ingredients in bulk created economies of scale for the restaurant.'
WHERE english = 'Economies of Scale'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '브랜드 자산',
  general_example = 'The brand equity of that logo made people trust the product immediately.'
WHERE english = 'Brand Equity'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '시장 점유율',
  general_example = 'Our market share grew after we launched the new product line.'
WHERE english = 'Market Share'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '외주, 위탁',
  general_example = 'She decided to outsource the logo design to a freelance artist.'
WHERE english = 'Outsourcing'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '기업 지배구조',
  general_example = 'Good corporate governance ensures leaders are held accountable to the board.'
WHERE english = 'Corporate Governance'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '조직 문화',
  general_example = 'The friendly organizational culture made new employees feel welcome quickly.'
WHERE english = 'Organizational Culture'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '인적자원관리',
  general_example = 'Human resource management ensures staff are trained and fairly compensated.'
WHERE english = 'Human Resource Management'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '벤치마킹, 기준 비교',
  general_example = 'She used benchmarking to compare her study habits with top students.'
WHERE english = 'Benchmarking'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '위험 관리',
  general_example = 'Good risk management means having a plan before problems arise.'
WHERE english = 'Risk Management'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '기업가 정신',
  general_example = 'Entrepreneurship requires courage to start something new despite uncertainty.'
WHERE english = 'Entrepreneurship'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '마케팅 믹스',
  general_example = 'The marketing mix of price, product, place, and promotion shaped the campaign.'
WHERE english = 'Marketing Mix'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '소비자 행동',
  general_example = 'Consumer behavior research revealed people prefer smaller packaging for snacks.'
WHERE english = 'Consumer Behavior'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '가치 사슬',
  general_example = 'Each step in the value chain adds something useful to the final product.'
WHERE english = 'Value Chain'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '포터의 5가지 경쟁요인',
  general_example = 'Porter''s Five Forces analysis helped identify the biggest threats in the industry.'
WHERE english = 'Porter''s Five Forces'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = 'SWOT 분석',
  general_example = 'A SWOT analysis helped the team understand their strengths and weaknesses.'
WHERE english = 'SWOT Analysis'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '핵심 성과 지표',
  general_example = 'Setting KPIs helped the team track their weekly progress clearly.'
WHERE english = 'KPI'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '재정 정책',
  general_example = 'The government''s fiscal policy cut taxes to encourage more spending.'
WHERE english = 'Fiscal Policy'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '통화 정책',
  general_example = 'The central bank used monetary policy to keep prices stable.'
WHERE english = 'Monetary Policy'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '세계화',
  general_example = 'Globalization means you can buy products made on the other side of the world.'
WHERE english = 'Globalization'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '기업의 사회적 책임',
  general_example = 'Corporate social responsibility led the company to reduce its plastic waste.'
WHERE english = 'Corporate Social Responsibility'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '배당금',
  general_example = 'Shareholders received a dividend payment at the end of the year.'
WHERE english = 'Dividend'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '벤처 캐피털',
  general_example = 'Venture capital funding helped the young startup hire its first engineers.'
WHERE english = 'Venture Capital'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '감사, 회계 감사',
  general_example = 'The audit of their expense reports found several billing errors.'
WHERE english = 'Audit'
  AND wordbook_id = 'a2000000-0000-0000-0000-000000000002'
  AND (general_meaning IS NULL OR general_example IS NULL);

-- ----------------------------------------------------------------
-- 역사학과
-- ----------------------------------------------------------------
UPDATE public.official_words SET
  general_meaning = '역사 서술, 역사 기록법',
  general_example = 'Her historiography of the event was praised for its thorough research.'
WHERE english = 'Historiography'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '1차 자료, 원본 자료',
  general_example = 'The journalist relied on primary sources rather than secondhand reports.'
WHERE english = 'Primary Source'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '2차 자료, 참고 자료',
  general_example = 'The student used secondary sources to support the argument in her essay.'
WHERE english = 'Secondary Source'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '제국주의',
  general_example = 'Imperialism often leads one country to dominate and exploit another.'
WHERE english = 'Imperialism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '식민주의',
  general_example = 'Colonialism left a lasting mark on the culture and language of many nations.'
WHERE english = 'Colonialism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '민족주의',
  general_example = 'Nationalism can unite a country but sometimes leads to conflict with others.'
WHERE english = 'Nationalism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '봉건제',
  general_example = 'The feudalism of the village meant the landlord controlled all the farmland.'
WHERE english = 'Feudalism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '르네상스, 부흥',
  general_example = 'The neighborhood saw a renaissance after new cafes and galleries opened.'
WHERE english = 'Renaissance'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '종교 개혁, 개혁 운동',
  general_example = 'The reformation of the school''s rules made students feel more respected.'
WHERE english = 'Reformation'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '계몽주의, 깨달음',
  general_example = 'Reading widely led to an enlightenment about how the world really works.'
WHERE english = 'Enlightenment'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '산업혁명',
  general_example = 'The industrial revolution changed how goods were made and how people lived.'
WHERE english = 'Industrial Revolution'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '냉전',
  general_example = 'There was a cold war of silence between the two neighbors for years.'
WHERE english = 'Cold War'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '전체주의',
  general_example = 'Totalitarianism leaves no room for individual freedom or dissent.'
WHERE english = 'Totalitarianism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '헤게모니, 지배력',
  general_example = 'One team''s hegemony in the league made competition less exciting.'
WHERE english = 'Hegemony'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '주권',
  general_example = 'Every person has sovereignty over their own personal decisions.'
WHERE english = 'Sovereignty'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '집단학살',
  general_example = 'Genocide is one of the most severe crimes against humanity.'
WHERE english = 'Genocide'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '명백한 운명, 팽창 신념',
  general_example = 'He felt it was his manifest destiny to lead the project from start to finish.'
WHERE english = 'Manifest Destiny'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '선거권, 참정권',
  general_example = 'Universal suffrage means every adult citizen can vote in elections.'
WHERE english = 'Suffrage'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '탈식민화, 독립',
  general_example = 'Decolonization of the mind means freeing yourself from imposed beliefs.'
WHERE english = 'Decolonization'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '민권 운동',
  general_example = 'The civil rights movement demanded equal treatment for all citizens.'
WHERE english = 'Civil Rights Movement'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '고고학',
  general_example = 'Archaeology uncovered ancient tools buried beneath the city streets.'
WHERE english = 'Archaeology'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '구술 역사',
  general_example = 'Oral history from elders preserved stories that were never written down.'
WHERE english = 'Oral History'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '패러다임 전환',
  general_example = 'The invention of the internet was a paradigm shift in how people communicate.'
WHERE english = 'Paradigm Shift'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '시대 구분, 시기 분류',
  general_example = 'Periodization of a student''s progress helped teachers plan lessons.'
WHERE english = 'Periodization'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '수정주의, 재해석',
  general_example = 'Revisionism in the debate challenged the commonly accepted version of events.'
WHERE english = 'Revisionism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '디아스포라, 이산',
  general_example = 'The diaspora community maintained their traditions even far from their homeland.'
WHERE english = 'Diaspora'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '중상주의',
  general_example = 'Mercantilism favored exports over imports to build national wealth.'
WHERE english = 'Mercantilism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '사회 계약',
  general_example = 'Living in a community involves a social contract to respect shared rules.'
WHERE english = 'Social Contract'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '봉건 영주',
  general_example = 'The feudal lord controlled all the land and collected taxes from farmers.'
WHERE english = 'Feudal Lord'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '십자군',
  general_example = 'He launched a crusade to clean up the polluted river in his community.'
WHERE english = 'Crusade'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '산업화',
  general_example = 'Industrialization of the town brought jobs but also pollution.'
WHERE english = 'Industrialization'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '세속주의',
  general_example = 'Secularism in government means laws are made without religious influence.'
WHERE english = 'Secularism'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '부르주아지, 중산 계급',
  general_example = 'The bourgeoisie in the story enjoyed luxury while workers struggled.'
WHERE english = 'Bourgeoisie'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '프롤레타리아트, 노동자 계급',
  general_example = 'The proletariat marched to demand better pay and working conditions.'
WHERE english = 'Proletariat'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '시대정신',
  general_example = 'The Zeitgeist of the decade was captured perfectly by that famous film.'
WHERE english = 'Zeitgeist'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '아날학파',
  general_example = 'The Annales School approach focuses on everyday life rather than famous events.'
WHERE english = 'Annales School'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);

UPDATE public.official_words SET
  general_meaning = '배상',
  general_example = 'The company paid reparations to communities affected by the oil spill.'
WHERE english = 'Reparations'
  AND wordbook_id = 'a3000000-0000-0000-0000-000000000003'
  AND (general_meaning IS NULL OR general_example IS NULL);
