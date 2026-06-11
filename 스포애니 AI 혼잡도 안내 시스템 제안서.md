# **스포애니(Spoany) 공간 맞춤형 AI 혼잡도 안내 시스템 도입 제안서**

## **Ⅰ. 서론: 왜 헬스장에는 '공간 인지형 비전 AI'가 필요한가?**

국내 최대 직영 피트니스 브랜드인 스포애니(Spoany)는 압도적인 회원 수를 보유하고 있으나, 특정 피크 타임(18시\~21시)에 집중되는 병목 현상으로 인해 고질적인 고객 불만(러닝머신 대기 시간 증가, 프리웨이트 존 과밀화)을 겪고 있습니다.

단순히 전체 입장 인원만을 카운팅하는 방식은 회원들에게 실질적인 가치를 제공하지 못합니다. 회원이 알고 싶어 하는 것은 "지금 가면 내가 운동하려는 유산소 기구가 남아 있는가?", "덤벨 존이 너무 붐벼서 스트레스를 받지 않을까?"에 대한 세부 구역별 정보입니다.

본 제안서는 스마트폰 rPPG 센싱의 기기별 성능 파편화 한계를 정면으로 돌파하기 위해, 환경 통제가 가능한 스포애니 오프라인 공간 내부의 기존 CCTV 인프라를 레버리지합니다. 고성능 엣지 AI 연산 장치(Jetson Orin Nano Super)와 안드로이드 기반의 화면 제어 허브를 결합하여, 회원의 운동 경험과 재등록을 견인할 '공간별 맞춤형 AI 혼잡도 안내 시스템'의 상세 아키텍처 및 공간별 알고리즘 작동 로직을 제안합니다\[cite: 2, 3\].

## **Ⅱ. 공간별 맞춤형 AI 혼잡도 안내: 공간 구조별 정밀 감지 핵심 로직**

스포애니 지점 내부의 구역은 회원들의 이용 목적과 머무르는 행태가 제각각입니다. 따라서 단일한 알고리즘을 일괄 적용하는 대신, 각 공간의 레이아웃 특성에 맞춰 비전 AI 감지 모델을 완벽하게 다변화하여 정밀한 혼잡도를 산출합니다.

### **1\. 유산소 존 (Cardio Zone): '기구 단위 ROI 개별 디텍션' 알고리즘**

* **공간적 특성:** 트레드밀, 스텝밀(천국의 계단), 사이클 등 고정된 기구가 일렬로 배치되는 구역.  
* **AI 탐지 로직:**  
  * 젯슨 오린 나노 슈퍼(Jetson Orin Nano Super)가 기존 CCTV 카메라 피드를 분석할 때, 전체 화면이 아닌 **각 기구의 안장 및 구동 구역을 개별 ROI(Region of Interest, 관심영역)로 정밀 분할 매핑**합니다.  
  * NVIDIA가 상용 사용을 공식 허용한 사람 검출 전용 모델 **PeopleNet**으로 인체 객체를 인식하고, 동일 인물(고유 ID)을 추적하여 ROI 영역 내 점유가 ![][image1] 이상 지속될 시 해당 기구를 '사용 중' 상태로 판정합니다.  
  * 단순히 사람이 기구 앞을 지나가는 노이즈 패턴은 고유 ID 추적과 시간 필터링을 통해 원천 배제합니다.  
* **출력 데이터:** "러닝머신 가용률: ![][image2]", "평균 대기시간: ![][image3]" 등의 수치화된 데이터 반환.

### **2\. 프리웨이트 / 머신 존 (Free-Weight & Machine Zone): '실시간 히트맵 및 군중 밀도 추정'**

* **공간적 특성:** 정해진 구획 없이 회원들이 덤벨 랙, 바벨 랙, 파워 랙 주변을 유동적으로 이동하며 기구를 공유하는 구역.  
* **AI 탐지 로직:**  
  * 개별 기구 매핑이 불가능하므로, 구역 전체의 평면을 격자(Grid) 단위로 분할한 뒤 **실시간 군중 밀도 추정(Crowd Density Estimation) 알고리즘**을 가동합니다.  
  * 회원들을 고유 ID로 추적하며 실루엣과 동선 벡터를 트래킹하여 특정 격자 구역에 인원이 밀집되는 패턴을 '히트맵(Heatmap)' 데이터로 실시간 시각화합니다.  
* **출력 데이터:** 구역의 한계 수용량 대비 밀도를 연산하여 세 단계의 가시적 지수로 변환합니다. (예: **\[여유\]** ![][image4] / **\[보통\]** ![][image5] / **\[혼잡\]** ![][image6]). "현재 덤벨 구역 매우 혼잡, 기구 웨이트 존 우회 권장" 등의 가이드를 자동으로 도출합니다.

### **3\. 독립 밀폐형 룸 (G.X / 스피닝 룸): '입출동선 양방향 카운팅 & 클래스 스케줄 연동'**

* **공간적 특성:** 문과 벽체로 완전히 가로막혀 있으며, 정해진 시간표에 따라 수십 명의 인원이 일시에 들어오고 빠져나가는 완전 독립 공간\[cite: 3\].  
* **AI 탐지 로직:**  
  * 룸 출입구 상단에 설치된 비전 카메라 및 감지 센서를 통해 **실시간 인/아웃(In/Out) 양방향 객체 트래킹 카운터**를 가동합니다. 실내에 잔류하는 정확한 실시간 헤드카운트(Headcount)를 산출합니다.  
  * 스포애니 지점별 G.X/스피닝 시간표 데이터베이스(Local DB/API)를 연동하여, 현재 시간 기준 수업 시작 전/후의 트래픽 급증 구간을 예측 연산합니다.  
* **출력 데이터:** "현재 참가 인원: ![][image7] (수업 중 \- 진입 자제)", "스피닝 시작 ![][image8] \- 입구 혼잡 예상" 등의 하이브리드 예측 정보를 도출합니다.

## **Ⅲ. 기술적 안전성: 영상 외부 미전송 및 로컬 엣지 연산**

개발 부서와 법무 팀이 가장 우려하는 **개인정보 보호법(CCTV 오용 및 초상권 침해)** 이슈를 원천 해결하기 위해 전 과정을 '온디바이스(On-Device) 로컬 엣지 연산'으로 설계했습니다.

* CCTV 카메라 스트림(RTSP)은 외부 인터넷 망이 아닌, 센터 내부의 스위칭 허브를 통해 **젯슨 오린 나노 슈퍼 보드로 로컬 전송**됩니다.  
* 인식·추적 연산은 매장 안에서 직접 수행되며, 원본 영상은 매장 밖으로 나가지 않고 연산 즉시 전량 파기(No Storage)됩니다. 외부로는 오직 가공된 혼잡도 수치(**JSON 데이터 패킷**)만 실시간 전송됩니다.  
* 서버 통신 비용이 발생하지 않으며, 외부 해킹이나 데이터 유출로부터 ![][image9] 안전한 폐쇄형 구조를 구현합니다.

## **Ⅳ. 제안 슬라이드 및 스토리텔링 구성안**

### **🔲 SLIDE 1\. 타이틀: 실시간 공간 정보의 가치**

* **비주얼 가이드:** 스포애니의 시그니처 앰버-오렌지 컬러와 화이트 톤의 조합. 미니멀한 테크니컬 디자인 레이아웃.  
* **헤드카피:** "지금 가도 바로 뛸 수 있을까?" 회원들의 일상적 의문에 응답하다  
* **메인 타이틀:** **스포애니 지점 최적화 온디바이스(On-device) AI 혼잡도 안내 시스템 제안**  
* **서브 타이틀:** CCTV 리소스를 활용한 젯슨 오린 엣지 비전 연산 인프라 기획안\[cite: 2\]

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Minimalist modern architectural style fitness center entrance, 3D render of a smart tablet glowing with real-time room occupancy bar graphs and seat maps. Deep contrast, professional studio lighting, 8k resolution.

### **🔲 SLIDE 2\. 페인 포인트: 회원의 재등록 의사를 꺾는 '대기 스트레스'**

* **비주얼 가이드:** 퇴근 시간 피크타임의 혼잡도 그래프와 병목 구간 사진의 병렬 배치.  
* **스토리텔링 구사:** "회원들의 이탈이 일어나는 가장 결정적인 순간은 언제일까요? 바로 퇴근 후 큰맘 먹고 운동하러 온 현장에서 러닝머신 자리가 없어 카운터 주변을 서성이거나, 덤벨 존의 가득 찬 인파에 질려 발걸음을 돌리는 순간입니다. 당사의 AI 시스템은 회원들이 스포애니 앱이나 매장 내 대형 TV 화면을 통해 가기 전 미리 각 구역의 상황을 확인하고 유연하게 운동 동선을 짤 수 있는 '선택권과 쾌적함'을 선물합니다."  
* **핵심 요약:**  
  * **유산소 기구 정체:** 무작정 대기로 인한 사용자 이용 경험 저하 및 PT 전환 흐름 방해.  
  * **프리웨이트 병목:** 덤벨, 랙 주변 과밀화에 따른 안전사고 우려 및 매장 내 밀집 피로도 증가.

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Split screen layout. Left: a highly congested free weight zone in a commercial gym under warm downlight. Right: an elegant infographic dashboard showcasing room congestion indicators (Smooth, Busy, Crowded) with bright cyan status lights.

### **🔲 SLIDE 3\. 시스템 구성도: 백엔드 AI 연산과 디스플레이 허브의 완전한 절연**

* **비주얼 가이드:** 데이터의 흐름(Raw Stream ➡️ JSON ➡️ UI Render)이 막힘 없이 전달되는 고화질 흐름 블록도.  
* **스토리텔링 구사:** "개발실장님들이 가장 흔히 겪으시는 트러블슈팅은 연산 병목으로 인한 시스템 크래시(Crash)입니다. 저희는 이를 방지하기 위해 역할을 완전히 쪼개었습니다. AI 인식·추적 연산만을 전담하는 백엔드 엔진 '젯슨 오린 나노 슈퍼'를 구동하고, 렌더링 및 디스플레이는 저렴하고 가벼운 전면의 안드로이드 기기가 전담합니다. 매장 밖으로는 원본 영상이 아닌 경량 혼잡도 데이터(JSON)만 이동하며, 로컬 소켓 통신을 기반으로 하므로 유선망 수준의 속도로 렉 없는 실시간 갱신을 지원합니다\[cite: 2\]."

\[지점 CCTV 피드\] ──(RTSP)──\> \[Jetson Orin Nano Super (백엔드)\]  
                                    │  
                         (로컬 JSON 가공 데이터 송출)  
                                    ▼  
                          \[안드로이드 14 셋톱박스 / 스마트 보드\]  
                                    │  
                               (UI 렌더링)  
                                    ▼  
                         \[매장 대형 TV 대시보드 화면 표출\]

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Technical blueprint diagram on deep blue grid paper, high-performance edge AI system design, minimal vector icons for camera feed, Jetson processor, and Android display hub, glowing optical signal transmission lines.

### **🔲 SLIDE 4\. AI 파이프라인: 사람을 '세는' AI와 '알아보는' AI**

* **비주얼 가이드:** 두 단계(인식 ➡️ 추적)가 흐르는 파이프라인 다이어그램. 좌측 '인식(Detection)' 박스에는 다수의 바운딩 박스, 우측 '추적(Tracking)' 박스에는 동일 인물 고유 ID(\#1\~\#8)가 유지되는 비교 목업.  
* **스토리텔링 구사:** "정확한 혼잡도는 두 단계 AI가 함께 만들어냅니다. **1단계 '인식(Detection)'** 은 화면 속 사람을 실시간으로 인식해 지금 몇 명이 어느 구역에 있는지를 매 순간 파악합니다. **2단계 '추적(Tracking)'** 은 같은 사람을 영상이 이어지는 동안 동일 인물로 추적해, 중복 없이 '서로 다른 N명'을 세고 구역별 체류 시간과 입·퇴장 흐름까지 산출합니다. 추적이 없으면 같은 사람이 수백 번 계수되지만, 추적이 있어야 신뢰할 수 있는 실제 인원이 나옵니다. 회원은 복잡한 기술을 알 필요 없이, 신뢰할 수 있는 숫자만 받아봅니다."  
* **핵심 요약:**  
  * **1단계 — 인식(Detection):** 화면 속 사람을 실시간 인식, 구역별 현재 인원 파악.  
  * **2단계 — 추적(Tracking):** 동일 인물 고유 ID 유지로 중복 계수 제거, 체류 시간·입퇴장 흐름 산출.  
* **라이선스 안전성:** 핵심 인식 엔진은 NVIDIA가 상용 사용을 공식 허용한 사람 검출 전용 모델 **PeopleNet**입니다. 라이선스 분쟁이나 사후 비용 리스크가 없으며, 매장 환경 맞춤 추가 학습도 동일 라이선스 안에서 가능합니다.

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Two-stage AI pipeline infographic on a dark background. Left panel labeled "Detection" with multiple neon bounding boxes over gym visitors. Right panel labeled "Tracking" showing the same individuals retaining persistent ID tags (#1 to #8) as they move. Clean technical vector style, cyan and orange accents, 8k resolution.

### **🔲 SLIDE 5\. 유산소 존 알고리즘: ROI 기반 개별 트레드밀 점유 식별**

* **비주얼 가이드:** CCTV 화면 격자선(그린/레드 ROI 박스) 위에 사람의 실루엣이 겹쳤을 때, 활성화 상호작용이 표시되는 인공지능 탐지 목업 화면.  
* **스토리텔링 구사:** "전체 머리수를 세는 뻔한 비전 AI 기술이 아닙니다. 기존 설치된 CCTV 화면 속의 각 러닝머신 발판 및 싸이클 구동부를 개별 관심구역(ROI)으로 바코드 그리드 매핑합니다\[cite: 2\]. 상용 사용이 허용된 검증 모델 PeopleNet으로 인식한 인체를 고유 ID로 추적하여, 동일 인물이 해당 픽셀 영역과 ![][image1] 이상 중첩된 채 모션이 지속될 때에만 '기구 사용 중'으로 트리거를 발생시킵니다. 카운터 직원이 직접 보지 않고도, 매장 러닝머신 전체 가용 상태가 1초 단위로 대시보드에 업데이트됩니다."

| 적용 기술 | 상세 로직 | 최종 반환 데이터 |
| :---- | :---- | :---- |
| **ROI 세그멘테이션** | CCTV 영상 평면 내 기구 구획 개별 그리드 매핑 | 각 트레드밀 ID별 ![][image10] (Occupied/Free) |
| **시간 도메인 필터링** | 객체 진입 시 ![][image1] 지속성 추적 연산 | 회원 스쳐 지나감, 가방 거치 등 단순 노이즈 차단 |
| **트래픽 웨이팅 연산** | 시간대별 회전율 통계 모델 링킹 | "러닝머신 평균 대기시간: ![][image3]" 예측값 환산 |

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Clean graphic showing real-time AI computer vision interface. Top-down isometric perspective of a line of treadmills with glowing neon green bounding boxes labeled "ID-01: FREE" and red bounding boxes labeled "ID-02: OCCUPIED", showing skeletal tracking overlay on jogging figures.

### **🔲 SLIDE 6\. 프리웨이트 존 알고리즘: 히트맵 기반 공간 혼잡 추정**

* **비주얼 가이드:** 고정되지 않는 프리웨이트 존 바닥에 따뜻한 온도 차트(블루에서 오렌지로 번지는 격자 히트맵)가 시뮬레이션된 입체 렌더링 샷.  
* **스토리텔링 구사:** "덤벨 랙이나 벤치프레스 랙처럼 회원들이 수시로 자리를 옮기거나 기구들을 섞어서 쓰는 구역은 기구 매핑이 무의미합니다. 당사는 해당 구역 바닥 평면 전체를 가상의 그리드 격자로 분할하고 **군중 밀도 추정 알고리즘**을 돌립니다. 사람의 밀도가 밀집되는 영역이 시각화되면, 이를 '여유, 보통, 혼잡'이라는 3단계 상태 코드로 간결하게 데이터화하여 매장 TV 디스플레이에 알람 가이드라인으로 표출합니다."

| 혼잡도 지수 | 격자 밀도 임계치 | 대시보드 출력 텍스트 가이드 |
| :---- | :---- | :---- |
| **여유 (Smooth)** | **![][image4]** 구역 점유 | "프리웨이트 존 이용이 매우 원활합니다. 즐거운 득근 시간 되세요\!" |
| **보통 (Normal)** | **![][image5]** 구역 점유 | "보통 수준의 밀도입니다. 세트 사이 쉬는 시간을 이용해 배려해 주세요." |
| **혼잡 (Busy)** | **![][image6]** 구역 점유 | "현재 덤벨 존 과밀 상태입니다. 유산소 및 머신 존 우회 이용을 권장합니다." |

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Minimalist interior design of a spacious weightlifting zone, 2D grid overlay illuminated with smart neon orange and yellow heat mapping clusters surrounding squat racks. Contemporary digital layout, ultra-clean commercial photography.

### **🔲 SLIDE 7\. 프로젝트 로드맵: 단독 가동 PoC에서 전사 앱 연동까지**

* **비주얼 가이드:** 간결하고 신속한 가로 마일스톤 흐름도.  
* **스토리텔링 구사:** "스포애니 본사와 처음부터 머리 아프게 데이터베이스(DB) 통합 및 서버 인프라 논의를 시작하지 않겠습니다. 그것은 개발 부서의 부담을 키워 계약 성사율만 떨어뜨립니다. 1단계로 스포애니 직영 지점 1곳의 기존 CCTV에 저희 젯슨 오린 나노 슈퍼 엣지 보드와 안드로이드 셋톱박스만 단독으로 가동하는 '단독형 엣지 패키지' 검토(PoC)를 진행합니다\[cite: 2\]. 현장에서 확실한 기술과 회원 만족도를 입증한 후, 2단계로 전 지점 도입 및 스포애니 모바일 앱 내 API 연동을 논의하여 도입 부담을 완전히 해소하겠습니다."

\[Phase 1 (6월\~PoC 검증)\]  
 \* 지점 단독형 하드웨어 공급 및 기존 CCTV 연동 가동\[cite: 2\].  
 \* 매장 대형 TV 디스플레이 대시보드 표출 및 혼잡도 정합성 교차 테스트.  
 \* 2\~4주 운영 데이터 기반 실측 정확도·실시간성 검증.  
                     ▼  
\[Phase 2 (PoC 통과 후 본 계약)\]  
 \* PoC 데이터 정량적 수치 기반 스포애니 전국 직영점 순차 공급 확산\[cite: 3\].  
 \* 스포애니 인앱(In-App) 모바일 서버 및 API 연동 "가기 전 혼잡도 확인 기능" 정식 탑재.

**📸 촬영 및 생성용 이미지 프롬프트 (Image Prompt)**

Corporate product delivery timeline infographic. Visual progression of a black micro-computer unit connecting to a fitness club's security camera system, with step arrows transitioning smoothly into a smartphone screen showing Spoany app's live occupancy interface. Elegant design aesthetic.

## **Ⅴ. 결론: "회원이 가장 배려받고 있다고 느끼는 프리미엄 스마트 헬스장"**

이 시스템의 도입은 스포애니에게 단순한 감지기 도입이 아닙니다. 회원권을 가입하고 재등록하러 온 유저들에게 "스포애니는 엣지 비전 AI를 활용하여 피크타임 혼잡도를 전 지점 단위로 정밀 케어하고 가이드해 드리는 대한민국 유일의 안심 과학 피트니스 브랜드"라는 확실하고 선도적인 네러티브를 부여할 것입니다\[cite: 3\].

저희 에이아이큐브는 이미 실내 조도 간섭과 데이터 파편화 이슈가 완벽히 차단된 엣지 연산 인프라 및 전용 분산 처리 아키텍처 구성을 마쳤습니다\[cite: 2\]. 6월 미팅 시, 제안서 내 가이드라인으로 배치된 모든 더미 이미지들을 당사가 **룩앤필에 맞춰 직접 정밀 촬영한 고품질 실제 기기 패킹 사진**으로 전량 수동 교체하여, 최종 발표용 슬라이드 덱으로 완벽하게 연출하여 피칭을 완성하겠습니다.

에이아이큐브의 압도적 비전 알고리즘 기술력으로 스포애니의 공간 만족도를 ![][image11] 끌어올리겠습니다.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAWCAYAAAAxSueLAAAB7klEQVR4Xu2USyiEURTHv0mKiIXGpHl880qRPBorKaWIhZ2kLGVnI2VhZWOhKGE3JGu2NqxsJMqWnUehTLGiKI/fGfer68wMo+z4178795z/ued85565jvOPP4VwONwUjUaHZXVdt07o9/srte5XEAgEKiKRyDpJ3iyual0OCGqEe4hvYAamtaZYxGKxAPH9iUQirH0Ojja4i8iVfTKZ9LM/gg1aS0FD2B/V1whv8V2yXns29lOE+D4dgGPWCBYs2xKctnUepH3BYDDEzxLt4w5niHuF86lUqlT7PUG+ZLO27jtIEZLIfFFOIVlIBfS31quE5GUEbbP2aW0hcAXNxJyQqMfRrfsKBHXDp7xtUOB+q9Aum9a9SoFFjT/CCQIu4DOc1H4bUgiaEXhP3I5Ms9jMX+EJ3sJTaakUpOOzkKoI7pLJCoVC5dpv7mUUnsE0jMkUyx+boakxshLsDZwzx3oF9wsmFCAYR7zoWP2ngDHsaxzea7cYWwfaQ9YHz/YjcHAnwed8XVD78gH9wLfJZAoRHcMMFbd4doJTEiyrrS+EopLF4/FqRAe0YUPuw5h92FZcMyTmRdlyc18NzTu563zEl8meTKJWNqdw0/2YMLn4FzX6PgqrNy99mWX/OeRgDmqnikFpiTymWvOPQngHkpSXCzNS1H4AAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAWCAYAAAAxSueLAAACDUlEQVR4Xu2VP0gcURDGT7xAJJKEkGPJ/du95RohYrGYwkIERdJYRVKGgMQiBCzEEJLKwl6sRLSwsImNoJWICjZKGhuDBFKciE2KgGCKg8T8JnlveY57ylqIhR98zHPmm5n35r09M5lb3EREUXQnn88/ZtmsY1dBNgiCnlKp9BT7UAcrlYoPtuFv1v06nhZZCr0ol8sH2M1cLteqBYVCoUjsEM2AjsluOgjsIPiIHRSyfit+rbXgVPOye1P0wCW+I3ia2AxnRPBEBA7rhJq01sI0SzwZ/iew1rAZyd8QfIYLcFQStM6FNBNqv+DSZnApaZeNYE62aAqfoYwf+5VH1KnzrtSMYrOwru9L3d2ozrN3tox9id2C+3BM61wQbxNq/6UwzX4wmg/FYrEFPuLv9TAMH2htWlDzroxWrHUENHzDMuuIniN6Z+OsN+AunIMzQnNv+3p8apR137xwW/sczGnjp12tVu/jG4HvadIju3WJ/xX2l/Zb8mi8f4UZWzviXvldU81qIrS+i4B+AO2x9p+BdET0Hf4hoc/6TbM986MaQ06K/xMcgl0Z8+GbZjVXm4QmxjIOX8va8U2ykWexSsHcVzxm0dJwWuvOQV4diSv+/490iEKr2J9a50I3S4tmGR0clH8Nnufd0wIXNJqQsclEJEdxmNgXuEatbp2bGvZ1+uYzaMApNKHOvRb8BQN+rNPWmxR7AAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAAWCAYAAACbiSE3AAABkUlEQVR4Xu2Wv0vDQBiGU0RQUKRKB0na/Fi66ZBVBN11EEWh4CLi7iK4OfQfcBbUP8BRXBwEQcRu7g6C0EFcBCeH+nz0Do6P4mKRGO+Bl6Zv3oT7vlzuEgQej8fj8QyFLMum4ji+RidRFI2Lx/FrvV5f1dnSkyTJFsW/NxqN3Hocn+LdS6PcbKmhEWMUfYme0az1acYB/z/5XXDzpUYaYBrRofCq9U0zemjfzZeaNE3n5RVBN7VabcL6/G+ZZrTdfKmRdYKCP3Qz8FekGbxG525+EDR0kfyZiGuWsUZ0xsL5Je0VhiE0o0LuCR0aySt3wa40rYMC993VXmH4aTPIpG7hsjVzzRF6QIkTFSqFXpAZXEZBXXTbbDYnrU8de9IMWUjdvIbcpvaCftHbXP+CWnmej4pkVtjvmELCAKsMuGOmt95ae2jNzWs4v6M9C2vJHM16NPcR3elM4WCQx6grs+Q7bxDyxLWnqIRhOCOSY32yiMi03qD4N9SO+9vq1b/6+tTI05OFE60Hf+QpejyeX+ULm6tkDIir6SwAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAWCAYAAABqgnq6AAABoElEQVR4Xu2XMUjDQBSGIyooChakFmmahNbNRQgOgoKogw4uori4iSDugqujuLroIDg4iODk4mRxdRMHEUGcHZwcdKnfSxNIH4IWKkT6Pvi5y7t319c/d0nrOIZhGEbb01ksFgel1QPGN/i+/4pe0HASC4Igx/U+7R3tJ6rRP0nPa0tc1+2NDWkwTOKe582Wy2WP+AR6N8OcaCdtohttWBqMC80wJzJiFCPOUdUM+4EwDLsx4bhUKk2ZYb8AE9YwYJdux18ZRv4hOmP+stwgPZ4gz0sdyxQUOIIBF/FPCXlLttww8pfI36PdQvfolutA5wnU4epYZoiP4oEcxSTWasN4sw6o3E7mrxN75HPHU/EI4qs6lhn48nMUf0m7IkdFxPUDeqO/QfHTpHWpOU0ZRv6kGKTjxGbQM+vsFAqFPqdu5AK61rmZgWLHKPBI6SPWKdompyc9p1nDyJuXG6Pjghw/xq5YrxbrSWrSeZnGrx/Hlh1Jp75DG3aphrVylUplyPlPf8fEoNio5G6Lqvl8vl8kfTUWCQMX9VqGYRhG9vgCAi+Gt6dZfakAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAWCAYAAACxOdCYAAACE0lEQVR4Xu2XzStEURjGaSiiWBgzzdedjyWRJklZSWLBAmVhJQvyByArFoqyko2yYafYsVCKpbKwUWpMWdpR/gGeZzpn5ni7Jh8bN++v3u49z/ueU+eZc997p6ZGURRFUf46+Xy+PpvNtkhd+QWe580g3j6J+3g8nmAdzcd4G1HMZDJdZu4Tov/jigqNWU2n0wepVGrKBsazNA8xaeugLWD8imsfx+FwuJnGo36ssppCamHMLk5et6vBqCWYt857CrlcLom6B8QZ9AZbyBpEtDxTKVHHk5dIJBqtwDHMO3H7rFdpERtWU74BjLtE9Ahtn6bC8E22Ctyf4lqw/VapTqkd8GoFPu587M1JfbY91by47tAa2suzq4B5e4gj9mzOlXlLMpkcl1qgwYY7EEOuZl5IV8bUY0h1NmdO71ql2h/UTaBuC9dF/hCIG4zTso58Zb1AwQ3B1KzQyicVuWU3Z4y+iEQiTa7uwt6MNQ4cKYQ5c9AKOJW9jl4C+rTUAgs3j81ex2KxNpmjKVVMveJpdnUXzBmgiVKHNoh4xNor5keh2aNfbSeBgJ9V2NSrn0HY+PxPTcXcEdlSLHzRIXdu1mEUZU2g4Uc8N+ZnEB7TTuRePPFJZYzYcTUf2IPLfdgPGN9qTmhI5gKNPY3soTJHoEeRv0DcmtpDT/+iVod9jY+q1AUhnOg8P4vQLoZlUlEU5R/zDnRJhzcRyEetAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAZCAYAAABuKkPfAAADdElEQVR4Xu1XTWgTQRTe0AoVfxFiLEl3Nj8YihchIniwF0UUFKUUFMSKCgrSk4cKWi+CF49eCqUgIqWowUsRUYstFKrgVVCEgEpBRPAg9FCw1u/rzpLpc7bJtjEF3Q8+svve7Js337z5iePEiBHjX0c2m1XgoXw+vx2vCelvCjzPa1NKtfNX+gj4LoA/wAm08aR/tUin0xnEfgwugMPS3xS4rpvD2J7rJM5LPwF7NziLtiXpawSKxeImxJ9CHvekryYymcw2aTOQYIkh+D5daqFgJYCfwO8Y6GdJ2iOKkECJd+GbG/imB8972QcGeQK/P/WMtwaNk8nkRtgmo4jQoktoAB0ck04CwXbA/4IzDJ7F82gul9sp2wUIREC8Xv28hNoeRQQrEOMh+A1xdpn2SCLg44N6Zl6DEzYRUB3r4Rtjh6VSaZ02J/D+NqwiDBH+iEfQDv8MxZe+KECMecTqd8QGGEkEEwh21ZY0hULAX2C3acf7HDo5ZdoC1ClCBWWdkr56wdlHjCFODJ6PIpcPnFA9qTMUqGEiINgt5W9yR4R9FhxxLMdQIIIK2RN0opWOjo798tt6wL0L378E76dSqQ3aVuBegYFvbXQltCJYmQN2xfpV/jE3yQ5NO8HZ4UZWY6NdEbAXbUG/4+BTcBh5PZP9NFSEIFiICJxpst20RwUSbbMJaYOugHHkcpcVoJfCIGwf8dvr6KpcExHAPnAaHAojEnqA34pYEotrV/nLbZ43PbMPE/B3gm+Uf/doCeyGEF9dfUqsiQiOPsfZKd4vMw7eFX2aj8BXXLeGbQm5SRqnj4kE4p5EmzH8etJJ8Du4zqFNJ9+NvO/ItsvCJgJLFYGeKLsIX8Ap3s5Muw1aHOv+UQt6gJ5jbMAcLPLpKRQKm6stqwhE4Jikb1nYRCCoJrggfRQGLDvGTY1gBTBBks+0aRGsJ8lKoDfH6+AV6SOCyZM510SYCAh4WPn3hNOmnTb4Lpk2ghsW4lyEfy6YCS1CQ//MsDJt+QagUCHLKxxI8poSFyLCWF/yxvgu7ManqpelRRHwfBPPZ2S71aCWCH8FFACXmz26zLuk3wQ3OQy8Ao4ES8Mk7APge3BUr/fIwCabxvdlGdvgoOufQNPIOy+/bwowtt1I4LayHJdIrp+Jos1xedGJAsvAbTwQeVnEiBHjv8RvdiA7xlJmWMcAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAZCAYAAAB3oa15AAAC0klEQVR4Xu1WO2hUURB9y8bCD/hdl+zvvt0VGwWLRSGiYhEFC220EFJaCJYGESxsRMQuJIWFaWKzKoKIhd8idiriB5SAIBiJtSAopND1HN/cdTK5T5e1SIp3YHh3zsydO3Pf3PteFGXIkCHDskOz2axaTiFfLpcrzrndcRyvs0ZBDjE2w2eIT+rWAbbpRqOxtl6vY+he1mq184i70dsrlcpK8Kdoo4+eG0Sr1VqBINsw4Srkg7UTCLoFtteQa0j+JOQ55DLnKp8NsN8D/xDPE4h5H882k/U+hUJhDbhzXsd4lAVgzh2MX0FeQH+C5xvIUe+XCjgPQz7JYu8gs9ZHFp2GXIhkR7lj0J8yAXEbwHgSctMXxSd1xL5COznog9DPyhyufxjcaa8LdwDchN6cnoBdmAoVUK1Wj4CfR+A9mgd3ETLDMWwtjL9BRozPCOQLYmwXfVEBWpf2u9VT61ikFQBunMkxSc1zYfA/OWZbYdxhQsaHO9yhXfT1bmELnYEcEjXHtnS9tE4IoQKKxeJqcI//UkCHY5e0T2oBkHHPOTnEstttOez9t45HqADV/3O8gbRNFyBzv6NVdhof/wamFHcJ3Gdw7+G/l5zcbrf7ah2PfxQwCxnUtkABobe0qIAABmAfc9I6cvhHITOQR9Y5FUtVgFwS3dZh8vC/QR1vZBe/C3ZOEKEC1Bn4imA7tC10BtyfA+l9/BmY1LyHbZ1SqbTJJde5v1pzdt1UhAogJLnQ7nZvIS7IRNMOcSy3kMGC1iG4hqzVjWNjpiKtAPDHwf9AoGHNu+R6nZPxEGTeJkqdPO2aJ2zrEP9TQB6O131CGnLdvXXmSxwnvxNj1OX/5a4LfInJ2z62reMBvzL4j3oj7M3WN3gesOBBFHoM9/jWSIrRkIO3jz7Scnnrg+T2S+G/fy8s+I1AEW3MfwB5Zu3LAUw8mLwGDvSqKLABGTJkSPAL5Hr48xXkkLoAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAWCAYAAABZuWWzAAACFUlEQVR4Xu2VT2sTURTFJ4SCRYuENoZmJpnJBMxGsGWQQruwi1JwIQgVKU13LoR+gbpQcONSENwKpct+gNLSdtGl1p0IXRdauxAFhXYh+Od3J++Fx2PaZCQxmzlwuHPveXPnzJ2XF8fJkCFDhkS4rutVq9X7dv1/IwiC177vf4On+HkPZ7QwATcQTuCvQZsNw/A6Pt56njcsea1Wmyf/EosUXczOMtVR4tNBm8XDIh4io5QjXzPyFiiuDtIsRq8wxU04btbFl5m3iynN5oIWHsjXkYdZer5er9+Qhysj48Vi8Zq1pg3R4REeCma9J2ZpvIuJHWITPoPHcAUpJzraOvkfIX23ie/gT67nrFYx2J+30X/YLyT9zTxGGrMyMdlLURQN6Rrmpmj8HS7pGtfT8LxSqdwivlLmH2vdhOxVtDPbbKKnNGYx9sKeUKlUusrD9uAhUypJTRuQbSAvVi6Xxyjnzfs0+mJWm5LmtmZ8+nuSawP2uiT0xaw0o+n+ZWZ1n5RmQ9aeNhqNEbNOzydmHqNbs11M9ndVbZGUZgus/eB3cXTlWPQc4ZEtJEH90+xJ1DXyBTEmUdf4Yd0hP3fUCdEJrJ3Ew7LO1dH3KU70m/vqiDF45FtvaAP9DfysprlP/Ajvat3YvzElN++/ADK0r/AlbHLPAXHLXvRPCNRhL3/XTpfT6wTpJdsRPuTL3XR61DdDEv4CrAeYSc/FOfkAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAZCAYAAAB3oa15AAADNElEQVR4Xu1WO2iUQRD+j0TwBT7Pw3vtPdRGweJQiKgIPsBCGy2EYGUhWBrOiEUaERFBQiy0SBMtjoggIhIfKWKnRnyAErBSiZVFQDQQJJ7fd5m9zM39l0RBSPF/MPw7s9/uzOzOzl0QRIgQIcKiQS6XW53NZnen0+nNdk6hLZVKpZ1zu8i3k4JYsVjcAE4Hv9QtAXMjhUJhVT6fx9C9ht8e7LvOzyOGZbCf4Rw5em0TSEYwV0AexXcQ3wlseDIwjsHbhLm3kFvgnYa85LpSqbREcdZifgj2J/iewj6P8K0wWM+Jx+MrYbvgdYy7mADW3Mf4DeQV9Gf4voMc87yWAKmMBecCCZjOYJvOZDJHPUecjkAueh5PDPpzBiC0doz7IXd8UvxSx/43OE8b9I3Qu2VNgPER2M56XWwHYbuuDycUyWRyPYgfIN9wVdu9HXoV8hCnspQ6k4E+xRKbXV3jXYKMcYy5EsY/IZ2G0wmZwB7bRG9KQOtSfnfnLR1CJcCAD3u7BPKZzkTvo41Bzq6uOe+G/TfHLCvuw4AMhydc5bzoa1xjCZWV75iU8/yl48Haxqb79XVhg1+QUTpLJBIrMB6eI4GqrGH5tEwA0udtTh6xnHZFHvvCS2c+SCC1a1X1P84OpHk6AZzcAMaTKJUdhuNvYEDZLsP2FbaP4O+hTbrbvQWVzlzA5lux0ZDvHCqBekkprk0g7JaaEghBO+Z7nZSOPP4uyBjkqSW3hHSg4ZC2918TkCZRLx0GD/4gddzITrZ6u6YJJMPZTYq2qzfwXXcqQifg5A041QyE499Av7Z72NJRjcW31pj12wS5sqtw1sOxnPo1bsZ5CS7sdOtdiA4ZKAM2nIYuZNBQOgR9iK/6PnZPixgWlLHReYzbaMCCAmy3efrUMXcC+jTsB/RCN9Nex2XcAZmygVKnnfPaTtjSIf46AWYPmWQgIH6hYPzDqSuXdvfemV/i3MzfiV7q8v/lgQv5Jabd1rEtHQ/wUrB/0gdhO9s/gzcCh4eQ5HE89C2BJKMhD28vOTzNQG5VA8Htk8Rrfy8spJlUsP4x5IWdXwxg4KHBa+ANLg9CDiBChAgz+AMAAg6xgcUX1AAAAABJRU5ErkJggg==>