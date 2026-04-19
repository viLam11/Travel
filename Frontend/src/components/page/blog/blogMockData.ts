// src/components/page/blog/blogMockData.ts
import type { BlogPost, BlogComment } from '@/types/blog.types';

const BASE_MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Hành trình khám phá Đà Nẵng — Thành phố đáng sống nhất Việt Nam',
    summary:
      'Từ những bãi biển trắng tinh đến dãy núi Ngũ Hành Sơn huyền bí, Đà Nẵng luôn có cách khiến bạn phải quay lại lần thứ hai, rồi lần thứ ba...',
    content: `
<h2>Tại sao lại là Đà Nẵng?</h2>
<p>Tôi đã đến Đà Nẵng lần đầu vào mùa hè năm 2023, và thật sự, thành phố này đã hoàn toàn chinh phục trái tim tôi. Không giống như Hà Nội ồn ào hay Sài Gòn hối hả, Đà Nẵng mang đến một nhịp sống vừa phải — đủ để bạn thư giãn, nhưng cũng đủ để khám phá.</p>

<h2>Ngày 1: Biển Mỹ Khê & Cầu Rồng</h2>
<p>Buổi sáng sớm, tôi dậy lúc 5h30 để bắt kịp ánh bình minh trên <strong>bãi biển Mỹ Khê</strong>. Mặt trời mọc từ từ phía chân trời, nhuộm hồng cả bầu trời và mặt biển — khung cảnh đẹp đến mức tôi đứng ngắm suốt 30 phút mà không chán.</p>
<p>Buổi tối, cả nhóm tìm đến <strong>Cầu Rồng</strong> để xem màn phun lửa vào cuối tuần. Hàng nghìn người chen chúc nhau nhưng không khí vô cùng vui vẻ và rộn ràng.</p>

<h2>Ngày 2: Ngũ Hành Sơn & Phố cổ Hội An</h2>
<p>Từ Đà Nẵng, chúng tôi thuê xe máy chạy khoảng 30km vào <strong>Hội An</strong> — một quyết định tuyệt vời. Phố cổ Hội An vào buổi tối lung linh ánh đèn lồng, mùi Cao Lầu và Mì Quảng bốc hơi thơm phức khắp các con ngõ nhỏ.</p>

<h2>Ẩm thực nhất định phải thử</h2>
<ul>
<li>🍜 Mì Quảng trứ danh tại quán Mì Quảng 1A đường Hải Phòng</li>
<li>🦞 Bánh tráng cuốn thịt heo — đặc sản không thể bỏ qua</li>
<li>🍹 Cocktail view biển tại các quán bar trên đường Võ Nguyên Giáp</li>
</ul>

<h2>Lời khuyên từ kinh nghiệm thực tế</h2>
<p>Du lịch Đà Nẵng lý tưởng nhất vào tháng 3-8, tránh mùa mưa bão từ tháng 9-12. Thuê xe máy khoảng 100k-150k/ngày là phương tiện di chuyển tiện nhất. Và quan trọng nhất: đừng bỏ qua bữa sáng với bánh mì Đà Nẵng — vừa ngon vừa rẻ!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    ],
    author: {
      id: 'u1',
      name: 'Nguyễn Minh Anh',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Backpacker nghiệp dư, đã đặt chân đến 30+ tỉnh thành Việt Nam',
    },
    createdAt: '2026-03-10T08:00:00Z',
    likes: 248,
    commentCount: 32,
    viewCount: 1205,
    tags: ['Đà Nẵng', 'Biển', 'Ẩm thực', 'Mùa hè'],
    linkedPlaces: [
      {
        id: '10',
        name: 'Ngũ Hành Sơn',
        type: 'place',
        location: 'Đà Nẵng',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        rating: 4.7,
        destination: 'da-nang',
        region: 'mien-trung',
      },
    ],
    linkedHotels: [
      {
        id: '1',
        name: 'Vinpearl Resort & Spa Đà Nẵng',
        type: 'hotel',
        location: 'Đà Nẵng',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        rating: 4.8,
        destination: 'da-nang',
        region: 'mien-trung',
      },
    ],
    readTimeMinutes: 7,
  },
  {
    id: '2',
    title: 'Sapa mùa tuyết rơi — Giấc mơ trắng giữa núi rừng Tây Bắc',
    summary:
      'Ít ai biết rằng Sapa có thể có tuyết vào những ngày giữa đông. Chuyến đi bất ngờ của tôi đến Sapa đã trở thành một trong những ký ức đẹp nhất.',
    content: `
<h2>Khi Sapa khoác áo trắng</h2>
<p>Tháng 12 năm ngoái, tôi nhận được tin nhắn từ bạn: "Sapa có tuyết rồi! Lên không?" — và 3 giờ sau, tôi đã xách ba lô lên đường. Đó là một quyết định tự phát nhưng hoàn toàn xứng đáng.</p>

<h2>Trekking qua các bản làng</h2>
<p>Chúng tôi thuê một hướng dẫn viên người H'Mông tên là A Páo để trekking từ Sapa xuống bản Cát Cát. Trời lạnh cắt da nhưng phong cảnh thì không thể nào tả được — những thửa ruộng bậc thang phủ sương mù, tiếng suối chảy rì rào...</p>

<h2>Ẩm thực vùng cao</h2>
<p>Thắng cố ngựa, thịt lợn cắp nách nướng, và đặc biệt là rượu ngô Bắc Hà — những món ăn này sẽ sưởi ấm bạn trong những ngày đông giá lạnh.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80',
    author: {
      id: 'u2',
      name: 'Trần Gia Huy',
      avatar: 'https://i.pravatar.cc/150?img=7',
      bio: 'Nhiếp ảnh gia & Travel blogger',
    },
    createdAt: '2026-03-05T14:30:00Z',
    likes: 412,
    commentCount: 58,
    viewCount: 2890,
    tags: ['Sapa', 'Tuyết', 'Trekking', 'Tây Bắc', 'Mùa đông'],
    linkedPlaces: [
      {
        id: '20',
        name: 'Bản Cát Cát',
        type: 'place',
        location: 'Sapa, Lào Cai',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400',
        rating: 4.6,
        destination: 'sapa',
        region: 'mien-bac',
      },
    ],
    linkedHotels: [
      {
        id: '5',
        name: 'Topas Ecolodge Sapa',
        type: 'hotel',
        location: 'Sapa, Lào Cai',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        rating: 4.9,
        destination: 'sapa',
        region: 'mien-bac',
      },
    ],
    readTimeMinutes: 5,
  },
  {
    id: '3',
    title: 'Phú Quốc 4 ngày 3 đêm — Cẩm nang chi tiết từ A đến Z',
    summary:
      'Hòn đảo ngọc của Việt Nam không chỉ đẹp mà còn đang phát triển nhanh chóng. Đây là mọi thứ bạn cần biết trước khi đặt vé.',
    content: `
<h2>Phú Quốc 2026 thay đổi như thế nào?</h2>
<p>Phú Quốc đang bùng nổ du lịch sau khi có casino và nhiều resort 5 sao. Nhưng đừng lo — nếu biết cách chọn lọc, bạn vẫn tìm được những góc yên bình tuyệt đẹp.</p>

<h2>Lịch trình gợi ý 4 ngày</h2>
<p><strong>Ngày 1:</strong> Đặt chân đến, check-in khách sạn, tắm biển Bãi Dài<br/>
<strong>Ngày 2:</strong> Tour 3 đảo (Hòn Thơm, Hòn Mây Rút, Hòn Gầm Ghì)<br/>
<strong>Ngày 3:</strong> Vinwonders + Safari<br/>
<strong>Ngày 4:</strong> Mua đặc sản, ra sân bay</p>

<h2>Chi phí thực tế</h2>
<p>Hai người trong 4 ngày 3 đêm (không tính vé máy bay): khoảng 8-12 triệu đồng tùy mức chi tiêu. Khách sạn 3 sao view biển khoảng 800k-1.2 triệu/đêm.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80',
    author: {
      id: 'u3',
      name: 'Lê Thu Trang',
      avatar: 'https://i.pravatar.cc/150?img=5',
      bio: 'Solo traveler & Food enthusiast',
    },
    createdAt: '2026-02-28T10:15:00Z',
    likes: 387,
    commentCount: 74,
    viewCount: 3102,
    tags: ['Phú Quốc', 'Đảo', 'Biển', 'Resort', 'Cẩm nang'],
    linkedPlaces: [
      {
        id: '30',
        name: 'Bãi Dài Phú Quốc',
        type: 'place',
        location: 'Phú Quốc, Kiên Giang',
        image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
        rating: 4.8,
        destination: 'phu-quoc',
        region: 'mien-nam',
      },
    ],
    linkedHotels: [
      {
        id: '8',
        name: 'JW Marriott Phú Quốc',
        type: 'hotel',
        location: 'Phú Quốc, Kiên Giang',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
        rating: 5.0,
        destination: 'phu-quoc',
        region: 'mien-nam',
      },
    ],
    readTimeMinutes: 8,
  },
  {
    id: '4',
    title: 'Hội An — Khi thời gian đứng yên trong ánh đèn lồng vàng',
    summary:
      'Mỗi lần đến Hội An tôi lại tìm thấy một góc nhỏ mới mà mình chưa từng thấy. Đây là bức thư tôi gửi đến thành phố nhỏ mà tôi yêu nhất.',
    content: `
<h2>Một tình yêu lãng mạn với Hội An</h2>
<p>Có những nơi bạn đến rồi bỏ đi. Và có những nơi bạn đến rồi muốn ở lại mãi. Hội An là loại thứ hai đó với tôi.</p>

<h2>Những góc chụp ảnh cực đẹp</h2>
<p>Chùa Cầu lúc 6 giờ sáng khi chưa có khách du lịch, con hẻm nhỏ trên đường Bạch Đằng đầy hoa giấy, và đặc biệt là sông Hoài lúc hoàng hôn — những khung hình này sẽ làm Instagram của bạn nổ tung.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
    author: {
      id: 'u4',
      name: 'Phạm Quang Vinh',
      avatar: 'https://i.pravatar.cc/150?img=12',
      bio: 'Content creator | Du lịch & Nhiếp ảnh',
    },
    createdAt: '2026-03-15T09:00:00Z',
    likes: 521,
    commentCount: 89,
    viewCount: 4210,
    tags: ['Hội An', 'Phố cổ', 'Văn hóa', 'Nhiếp ảnh'],
    linkedPlaces: [
      {
        id: '40',
        name: 'Phố cổ Hội An',
        type: 'place',
        location: 'Hội An, Quảng Nam',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
        rating: 4.9,
        destination: 'hoi-an',
        region: 'mien-trung',
      },
    ],
    linkedHotels: [],
    readTimeMinutes: 4,
  },
  {
    id: '5',
    title: 'Hà Giang Loop — 5 ngày chinh phục cung đường đẹp nhất Việt Nam',
    summary:
      'Hà Giang Loop không phải cho người yếu tim. Nhưng nếu bạn đủ can đảm, đây sẽ là cuộc hành trình thay đổi quan điểm sống của bạn.',
    content: `
<h2>Chuẩn bị gì trước khi đi?</h2>
<p>Hà Giang Loop dài khoảng 350km, đi qua Đồng Văn, Mèo Vạc, Mã Pí Lèng. Bạn cần có bằng lái A1, xe máy tay số (không nên đi xe tay ga), và quan trọng nhất là sức khỏe tốt.</p>

<h2>Đèo Mã Pí Lèng — "Sống lưng khủng long"</h2>
<p>Nếu có một điểm dừng chân không được bỏ lỡ trên toàn cung đường, đó là Mã Pí Lèng. Nhìn xuống thung lũng sông Nho Quế xanh ngọc bên dưới, bạn sẽ hiểu tại sao người ta gọi nơi này là "nóc nhà Đông Dương".</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80',
    author: {
      id: 'u5',
      name: 'Vũ Đức Thắng',
      avatar: 'https://i.pravatar.cc/150?img=15',
      bio: 'Motorhead & Phượt thủ cầu kỳ',
    },
    createdAt: '2026-03-18T07:30:00Z',
    likes: 693,
    commentCount: 112,
    viewCount: 5890,
    tags: ['Hà Giang', 'Loop', 'Xe máy', 'Núi', 'Phượt'],
    linkedPlaces: [
      {
        id: '50',
        name: 'Đèo Mã Pí Lèng',
        type: 'place',
        location: 'Mèo Vạc, Hà Giang',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400',
        rating: 4.9,
        destination: 'ha-giang',
        region: 'mien-bac',
      },
    ],
    linkedHotels: [],
    readTimeMinutes: 10,
  },
];

// Generate more posts to demonstrate Infinite Scroll
export const MOCK_BLOG_POSTS: BlogPost[] = [
  ...Array.from({ length: 4 }).flatMap((_, i) => 
    BASE_MOCK_POSTS.map(post => ({
      ...post,
      id: `${post.id}_copy_${i}`,
      title: i === 0 ? post.title : `${post.title} (Phần ${i + 1})`,
      likes: post.likes + Math.floor(Math.random() * 50),
      // Giả lập lùi ngày để thấy posts được sắp xếp
      createdAt: new Date(new Date(post.createdAt).getTime() - i * 86400000 * 3).toISOString()
    }))
  )
];

export const MOCK_COMMENTS: Record<string, BlogComment[]> = {
  '1': [
    {
      id: 'c1',
      postId: '1',
      author: { id: 'u10', name: 'Kiều Linh', avatar: 'https://i.pravatar.cc/150?img=20' },
      content: 'Bài viết rất chi tiết và hữu ích! Mình vừa đặt vé đi Đà Nẵng tuần sau rồi 😍',
      createdAt: '2026-03-11T10:00:00Z',
      likes: 14,
      replies: [
        {
          id: 'c1r1',
          postId: '1',
          parentId: 'c1',
          author: { id: 'u1', name: 'Nguyễn Minh Anh', avatar: 'https://i.pravatar.cc/150?img=1' },
          content: 'Chúc bạn có chuyến đi vui vẻ nhé! Nhớ thử bánh mì Bà Lan đầu đường Hải Phòng nha 🥰',
          createdAt: '2026-03-11T11:30:00Z',
          likes: 8,
        },
      ],
    },
    {
      id: 'c2',
      postId: '1',
      author: { id: 'u11', name: 'Thanh Bình', avatar: 'https://i.pravatar.cc/150?img=22' },
      content: 'Cầu Rồng phun lửa thật ra chỉ có tối thứ 7 và CN thôi bạn ơi, mình bị hụt mất lần trước 😂',
      createdAt: '2026-03-12T08:15:00Z',
      likes: 21,
    },
    {
      id: 'c3',
      postId: '1',
      author: { id: 'u12', name: 'Hải Đăng', avatar: 'https://i.pravatar.cc/150?img=24' },
      content: 'Mì Quảng 1A đúng là ngon cực! Mà quán hay hết đồ ăn lúc 9-10h sáng nên phải đến sớm nhé 👍',
      createdAt: '2026-03-13T14:20:00Z',
      likes: 9,
    },
  ],
  '2': [
    {
      id: 'c4',
      postId: '2',
      author: { id: 'u13', name: 'Lan Anh', avatar: 'https://i.pravatar.cc/150?img=30' },
      content: 'Ảnh Sapa tuyết của bạn đẹp quá!! Mình cũng muốn đi lắm nhưng sợ lạnh 🥶',
      createdAt: '2026-03-06T09:00:00Z',
      likes: 33,
    },
  ],
  '5': [
    {
      id: 'c5',
      postId: '5',
      author: { id: 'u14', name: 'Minh Tuấn', avatar: 'https://i.pravatar.cc/150?img=35' },
      content: 'Hà Giang Loop là trải nghiệm tuyệt nhất của đời mình! Bạn tả chuẩn lắm 🔥',
      createdAt: '2026-03-19T08:00:00Z',
      likes: 47,
    },
  ],
};

// Simple in-memory store for created posts
let runtimePosts: BlogPost[] = [];

export const blogStore = {
  getAllPosts(): BlogPost[] {
    return [...runtimePosts.reverse(), ...MOCK_BLOG_POSTS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getPostById(id: string): BlogPost | undefined {
    return [...runtimePosts, ...MOCK_BLOG_POSTS].find((p) => p.id === id);
  },

  getComments(postId: string): BlogComment[] {
    return MOCK_COMMENTS[postId] || [];
  },

  addPost(post: BlogPost) {
    runtimePosts = [post, ...runtimePosts];
  },

  toggleLike(postId: string): boolean {
    // Returns new isLiked state - in real app this calls API
    return true;
  },
};
