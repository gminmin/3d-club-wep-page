const memberData = {
    kms: {
        name: "강민수",
        role: "진부중학교 3D 동아리 부장/방송부",
        email: "kms@jinbu.ms.kr",
        summary: "영상제작에 관심이 많으며 3D 동아리 및 방송부 활동으로 실력을 성장해왔습니다.",
        photoColor: "#FF5500", // Placeholder for actual photo
        links: [
            { name: "ArtStation", url: "#" },
            { name: "GitHub", url: "#" }
        ],
        education: [
            { title: "진부중학교 (Jinbu Middle School)", subtitle: "3D 창작 동아리 기장 (Founder)", date: "2023.03 - Present" },
            { title: "Blender Master Class", subtitle: "Advanced Modeling & Nodes 수료", date: "2024.01 - 2024.03" }
        ],
        awards: [
            { title: "2024 청소년 3D 모델링 대회", subtitle: "대상 (Grand Prize) - 'City of Tomorrow'", date: "2024.08" },
            { title: "강원도 창의과학 경진대회", subtitle: "금상 - 가상 시뮬레이션 부문", date: "2023.11" }
        ],
        skills: [
            { name: "Blender", level: 95 },
            { name: "Hard Surface Modeling", level: 90 },
            { name: "Geometry Nodes", level: 75 },
            { name: "Substance Painter", level: 60 }
        ],
        projects: [
            {
                title: "Procedural Sci-Fi City Generator",
                role: "Solo Developer",
                desc: "Blender Geometry Nodes를 활용하여 매개변수 조절만으로 다양한 형태의 SF 도시를 생성하는 절차적 시스템 개발. 건물 높이, 밀도, 도로망 등을 실시간으로 수정 가능하도록 최적화함.",
                tags: ["Blender", "Geometry Nodes", "Python Scripting"]
            },
            {
                title: "School Virtual Tour Project",
                role: "Project Manager & Environment Artist",
                desc: "학교 전체를 3D로 구현하여 웹에서 탐방 가능한 가상 투어 제작. 최적화 작업을 주도하여 모바일 환경에서도 60fps 유지 달성. 팀원 4명의 작업 분배 및 일정 관리 담당.",
                tags: ["Unreal Engine 5", "Optimization", "Team Leading"]
            }
        ]
    },
    loy: {
        name: "Lee Onyu",
        role: "Character Artist",
        email: "loy@jinbu.ms.kr",
        summary: "스토리텔링이 담긴 캐릭터를 창조하는 캐릭터 아티스트입니다. 인체 해부학에 대한 깊은 이해를 바탕으로 사실적인 조형과 카툰 렌더링 스타일을 모두 소화합니다. 캐릭터의 성격과 서사를 시각적으로 풀어내는 데 강점이 있습니다.",
        photoColor: "#4facfe",
        links: [
            { name: "ArtStation", url: "#" },
            { name: "Twitter", url: "#" }
        ],
        education: [
            { title: "진부중학교 (Jinbu Middle School)", subtitle: "3D 동아리 캐릭터 팀장", date: "2023.03 - Present" },
            { title: "Anatomy for Artists", subtitle: "인체 드로잉 및 조형 과정 수료", date: "2023.06 - 2023.09" }
        ],
        awards: [
            { title: "2024 캐릭터 컨셉 아트 공모전", subtitle: "최우수상 - 'Guardian of Digital'", date: "2024.05" },
            { title: "교내 예술제 전시 부문", subtitle: "인기상", date: "2023.12" }
        ],
        skills: [
            { name: "ZBrush", level: 90 },
            { name: "Character Design", level: 95 },
            { name: "Marvelous Designer", level: 70 },
            { name: "Anatomy", level: 85 }
        ],
        projects: [
            {
                title: "Virtual Idol 'Sera'",
                role: "Lead Character Artist",
                desc: "가상 아이돌 'Sera'의 초기 컨셉 디자인부터 3D 모델링, 리깅, 쉐이딩까지 전 과정 담당. 특히 표정 블렌드 쉐이프(Blend Shapes) 52종을 제작하여 풍부한 감정 표현 구현.",
                tags: ["Character Modeling", "Blend Shapes", "Facial Rigging"]
            },
            {
                title: "Short Animation 'The Spark'",
                role: "Art Director",
                desc: "단편 애니메이션의 아트 디렉팅을 맡아 전반적인 톤앤매너 설정 및 캐릭터 스타일 가이드라인 제작. 3명의 팀원들과 협업하여 일관된 비주얼 퀄리티 유지.",
                tags: ["Art Direction", "Visual Dev", "Collaboration"]
            }
        ]
    },
    csh: {
        name: "Choi Seungho",
        role: "Environment Artist",
        email: "csh@jinbu.ms.kr",
        summary: "공간에 감정을 불어넣는 배경 아티스트입니다. 빛과 대기를 활용한 무드 연출(Lighting & Atmosphere)에 탁월하며, 대규모 지형 제작 및 자연물 묘사에 강점이 있습니다. 언리얼 엔진을 활용한 리얼타임 렌더링 환경 구축을 즐깁니다.",
        photoColor: "#43e97b",
        links: [
            { name: "Behance", url: "#" }
        ],
        education: [
            { title: "진부중학교 (Jinbu Middle School)", subtitle: "3D 동아리 배경/레벨디자인 팀장", date: "2023.03 - Present" }
        ],
        awards: [
            { title: "2024 환경 디자인 공모전", subtitle: "입선", date: "2024.10" }
        ],
        skills: [
            { name: "Unreal Engine", level: 80 },
            { name: "Environment Art", level: 90 },
            { name: "Lighting", level: 92 },
            { name: "SpeedTree", level: 60 }
        ],
        projects: [
            {
                title: "Project: Ancient Ruins",
                role: "Solo Project",
                desc: "잊혀진 고대 유적을 주제로 한 시네마틱 환경 제작. Quixel Megascans 에셋을 활용하되, 커스텀 쉐이더를 통해 독창적인 분위기 연출. Volumetric Fog를 활용한 깊이감 있는 라이팅 세팅 연구.",
                tags: ["Unreal Engine 5", "Lighting", "Cinematic"]
            },
            {
                title: "Modular Dungeon Kit",
                role: "Asset Creator",
                desc: "게임 제작에 사용할 수 있는 모듈형 던전 에셋 키트 제작. 그리드 스냅을 고려한 설계로 레벨 디자인의 효율성을 높임. 텍스처 아틀라스 최적화 적용.",
                tags: ["Game Assets", "Modular Design", "Optimization"]
            }
        ]
    }
};
