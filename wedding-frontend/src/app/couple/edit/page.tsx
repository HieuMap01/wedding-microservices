'use client';

import { useEffect, useState, FormEvent } from 'react';
import { weddingApi, WeddingResponse } from '@/lib/api';

export default function EditWeddingPage() {
    const [wedding, setWedding] = useState<WeddingResponse | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [venueType, setVenueType] = useState<'common' | 'separate'>('common');
    const [form, setForm] = useState({
        groomName: '',
        brideName: '',
        loveStory: '',
        primaryColor: '#e11d48',
        secondaryColor: '#f43f5e',
        weddingDate: '',
        venueName: '',
        venueAddress: '',
        venueLat: '',
        venueLng: '',
        groomHouseName: '',
        groomHouseAddress: '',
        groomHouseLat: '',
        groomHouseLng: '',
        brideHouseName: '',
        brideHouseAddress: '',
        brideHouseLat: '',
        brideHouseLng: '',
        slug: '',
    });

    useEffect(() => {
        loadWedding();
    }, []);

    const loadWedding = async () => {
        try {
            const res = await weddingApi.getMine();
            setWedding(res.data);
            setForm({
                groomName: res.data.groomName || '',
                brideName: res.data.brideName || '',
                loveStory: res.data.loveStory || '',
                primaryColor: res.data.primaryColor || '#e11d48',
                secondaryColor: res.data.secondaryColor || '#f43f5e',
                weddingDate: res.data.weddingDate ? res.data.weddingDate.slice(0, 16) : '',
                venueName: res.data.venueName || '',
                venueAddress: res.data.venueAddress || '',
                venueLat: res.data.venueLat?.toString() || '',
                venueLng: res.data.venueLng?.toString() || '',
                groomHouseName: res.data.groomHouseName || '',
                groomHouseAddress: res.data.groomHouseAddress || '',
                groomHouseLat: res.data.groomHouseLat?.toString() || '',
                groomHouseLng: res.data.groomHouseLng?.toString() || '',
                brideHouseName: res.data.brideHouseName || '',
                brideHouseAddress: res.data.brideHouseAddress || '',
                brideHouseLat: res.data.brideHouseLat?.toString() || '',
                brideHouseLng: res.data.brideHouseLng?.toString() || '',
                slug: res.data.slug || '',
            });
            if (res.data.groomHouseAddress || res.data.brideHouseAddress) {
                setVenueType('separate');
            } else {
                setVenueType('common');
            }
        } catch {
            setIsNew(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const data: Record<string, unknown> = {
                ...form,
                venueLat: form.venueLat ? parseFloat(form.venueLat) : null,
                venueLng: form.venueLng ? parseFloat(form.venueLng) : null,
                groomHouseLat: form.groomHouseLat ? parseFloat(form.groomHouseLat) : null,
                groomHouseLng: form.groomHouseLng ? parseFloat(form.groomHouseLng) : null,
                brideHouseLat: form.brideHouseLat ? parseFloat(form.brideHouseLat) : null,
                brideHouseLng: form.brideHouseLng ? parseFloat(form.brideHouseLng) : null,
                weddingDate: form.weddingDate || null,
            };

            if (isNew) {
                const res = await weddingApi.create(data);
                setWedding(res.data);
                setIsNew(false);
                setMessage('✅ Thiệp cưới đã được tạo thành công!');
            } else {
                const res = await weddingApi.updateMine(data);
                setWedding(res.data);
                setMessage('✅ Cập nhật thông tin thành công!');
            }
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Có lỗi xảy ra'));
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            const res = await weddingApi.publish();
            setWedding(res.data);
            setMessage('🎉 Tuyệt vời! Thiệp đã được xuất bản công khai. Giờ đây bạn có thể copy link để gửi cho bạn bè.');
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Có lỗi khi xuất bản'));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingImage(true);
        try {
            const uploadPromises = Array.from(files).map(file => weddingApi.uploadImage(file));
            await Promise.all(uploadPromises);
            await loadWedding();
            setMessage('✅ Đã tải ảnh lên thành công!');
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Tải lên thất bại'));
        } finally {
            setUploadingImage(false);
            // Reset input so the same files can be selected again if needed
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi album thẻ thiệp?')) return;
        try {
            await weddingApi.deleteImage(imageId);
            await loadWedding();
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Xóa thất bại'));
        }
    };

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    if (loading) {
        return <div className="flex justify-center p-12 text-slate-400">Đang tải dữ liệu thiệp...</div>;
    }

    return (
        <div className="max-w-4xl animate-fade-in-up pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">
                        {isNew ? '✨ Khởi tạo thiệp cưới' : '✏️ Chỉnh sửa thiệp cưới'}
                    </h1>
                    <p className="text-slate-500 text-sm">Điền đầy đủ thông tin để thiệp mời của bạn thật hoàn hảo.</p>
                </div>
                {!isNew && !wedding?.isPublished && (
                    <button onClick={handlePublish} className="btn-primary">
                        🚀 Xuất bản ngay
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-8 p-4 rounded-xl text-sm font-medium ${message.startsWith('✅') || message.startsWith('🎉')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                    {message}
                </div>
            )}

            <form id="wedding-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Couple Info */}
                <div className="card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span>👫</span> Thông tin cặp đôi
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên cô dâu</label>
                            <input className="input-field" value={form.brideName} onChange={(e) => update('brideName', e.target.value)} required placeholder="Trần Thị B" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên chú rể</label>
                            <input className="input-field" value={form.groomName} onChange={(e) => update('groomName', e.target.value)} required placeholder="Nguyễn Văn A" />
                        </div>
                    </div>
                    {isNew && (
                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Đường dẫn chia sẻ (Tùy chọn)</label>
                            <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                <span className="px-4 py-3 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-mono whitespace-nowrap">
                                    wedding.com/wedding/
                                </span>
                                <input className="flex-1 px-4 py-3 bg-white text-slate-900 focus:outline-none" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="minh-va-lan" />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Bỏ trống hệ thống sẽ tự động tạo URL ngẫu nhiên.</p>
                        </div>
                    )}
                </div>

                {/* Event details with Map Integration */}
                <div className="card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span>📍</span> Thông tin sự kiện và Bản đồ
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày giờ tổ chức tiệc</label>
                            <input type="datetime-local" className="input-field max-w-sm" value={form.weddingDate} onChange={(e) => update('weddingDate', e.target.value)} />
                        </div>
                        <div className="flex gap-4 mb-4">
                            <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${venueType === 'common' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                <input type="radio" name="venueType" className="sr-only" checked={venueType === 'common'} onChange={() => setVenueType('common')} />
                                <span className="font-semibold text-sm">🏨 Tổ chức chung (Nhà Hàng)</span>
                            </label>
                            <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${venueType === 'separate' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                <input type="radio" name="venueType" className="sr-only" checked={venueType === 'separate'} onChange={() => setVenueType('separate')} />
                                <span className="font-semibold text-sm">🏠 Tổ chức riêng (Nhà Trai & Gái)</span>
                            </label>
                        </div>

                        {venueType === 'common' ? (
                            <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tên nhà hàng / Địa điểm</label>
                                    <input className="input-field" value={form.venueName} onChange={(e) => update('venueName', e.target.value)} placeholder="VD: Trung tâm Tiệc cưới GEM Center" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ chính xác</label>
                                    <input className="input-field" value={form.venueAddress} onChange={(e) => update('venueAddress', e.target.value)} placeholder="8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP.HCM" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50">
                                    <h4 className="font-semibold text-sky-800 mb-3 block text-sm">🤵 Thông tin tổ chức Nhà Trai</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên địa điểm (Nhà Trai)</label>
                                            <input className="input-field text-sm py-2" value={form.groomHouseName} onChange={(e) => update('groomHouseName', e.target.value)} placeholder="Tư gia Nhà Trai" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ (Nhà Trai) *</label>
                                            <input className="input-field text-sm py-2" value={form.groomHouseAddress} onChange={(e) => update('groomHouseAddress', e.target.value)} placeholder="123 Đường Nam, Phường 1, Quận 1..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Vĩ độ Nhà Trai (Latitude)</label>
                                            <input type="number" step="any" className="input-field py-2 text-sm" value={form.groomHouseLat} onChange={(e) => update('groomHouseLat', e.target.value)} placeholder="Tự điền nếu bản đồ bị lệch" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Kinh độ Nhà Trai (Longitude)</label>
                                            <input type="number" step="any" className="input-field py-2 text-sm" value={form.groomHouseLng} onChange={(e) => update('groomHouseLng', e.target.value)} placeholder="Tự điền nếu bản đồ bị lệch" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                                    <h4 className="font-semibold text-rose-800 mb-3 block text-sm">👰 Thông tin tổ chức Nhà Gái</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên địa điểm (Nhà Gái)</label>
                                            <input className="input-field text-sm py-2" value={form.brideHouseName} onChange={(e) => update('brideHouseName', e.target.value)} placeholder="Tư gia Nhà Gái" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ (Nhà Gái) *</label>
                                            <input className="input-field text-sm py-2" value={form.brideHouseAddress} onChange={(e) => update('brideHouseAddress', e.target.value)} placeholder="456 Đường Nữ, Phường 2, Quận 3..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Vĩ độ Nhà Gái (Latitude)</label>
                                            <input type="number" step="any" className="input-field py-2 text-sm" value={form.brideHouseLat} onChange={(e) => update('brideHouseLat', e.target.value)} placeholder="Tự điền nếu bản đồ bị lệch" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Kinh độ Nhà Gái (Longitude)</label>
                                            <input type="number" step="any" className="input-field py-2 text-sm" value={form.brideHouseLng} onChange={(e) => update('brideHouseLng', e.target.value)} placeholder="Tự điền nếu bản đồ bị lệch" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interactive Google Maps Embedded View */}
                        <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h4 className="font-semibold text-slate-800">Bản đồ chỉ đường (Hiển thị cho khách)</h4>
                                    <p className="text-xs text-slate-500 mt-1">Bản đồ tự động cập nhật theo địa chỉ bạn nhập bên trên.</p>
                                </div>
                            </div>

                            <div className="w-full h-[300px] bg-slate-200 rounded-lg overflow-hidden relative shadow-inner">
                                {form.venueAddress ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(form.venueAddress + (form.venueName ? ', ' + form.venueName : ''))}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 p-8 text-center flex-col">
                                        <span className="text-4xl mb-3">🗺️</span>
                                        Vui lòng nhập "Địa chỉ chính xác" để xem trước hiển thị bản đồ.
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200 grid sm:grid-cols-2 gap-4">
                                {(venueType === 'common' && form.venueAddress) && (
                                    <div className="col-span-2 text-sm text-slate-500 bg-slate-100 p-3 rounded-md mb-2">
                                        Đang hiển thị bản đồ cho: <b>{form.venueAddress}</b>
                                    </div>
                                )}
                                {(venueType === 'separate' && (form.groomHouseAddress || form.brideHouseAddress)) && (
                                    <div className="col-span-2 text-sm text-slate-500 bg-slate-100 p-3 rounded-md mb-2">
                                        <i>Lưu ý:</i> Vì bạn đã cấu hình Nhà Trai / Nhà Gái, bản đồ sẽ tự động tách làm 2 trên trang mời khách hiển thị lần lượt Nhà Trai trước, Nhà Gái sau. (Ở đây chúng tôi ẩn bản đồ để bạn tập trung nhập dữ liệu).
                                    </div>
                                )}

                                {venueType === 'common' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Vĩ độ (Latitude) - Nâng cao</label>
                                            <input type="number" step="any" className="input-field py-2 text-sm" value={form.venueLat} onChange={(e) => update('venueLat', e.target.value)} placeholder="Tự điền nếu bản đồ bị lệch" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Kinh độ (Longitude) - Nâng cao</label>
                                            <input type="number" step="any" className="input-field py-2 text-sm" value={form.venueLng} onChange={(e) => update('venueLng', e.target.value)} placeholder="Tự điền nếu bản đồ bị lệch" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story */}
                <div className="card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span>💕</span> Câu chuyện tình yêu
                    </h3>
                    <textarea
                        className="input-field min-h-[150px] resize-y p-4 text-slate-700 leading-relaxed"
                        value={form.loveStory}
                        onChange={(e) => update('loveStory', e.target.value)}
                        placeholder="Hãy chia sẻ câu chuyện tình yêu ngọt ngào của hai bạn để chiếc thiệp mời thêm phần ý nghĩa (không bắt buộc)..."
                    />
                </div>

                {/* Colors */}
                <div className="card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span>🎨</span> Màu sắc chủ đạo (Thiết kế thiệp)
                    </h3>
                    <div className="grid grid-cols-2 gap-6 max-w-lg">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nền sắc chính</label>
                            <div className="flex items-center gap-3">
                                <div className="p-1 border border-slate-200 rounded-lg inline-block bg-white shadow-sm">
                                    <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-12 h-10 cursor-pointer border-0 bg-transparent rounded block" />
                                </div>
                                <span className="font-mono text-sm text-slate-500 uppercase">{form.primaryColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Điểm nhấn phụ</label>
                            <div className="flex items-center gap-3">
                                <div className="p-1 border border-slate-200 rounded-lg inline-block bg-white shadow-sm">
                                    <input type="color" value={form.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="w-12 h-10 cursor-pointer border-0 bg-transparent rounded block" />
                                </div>
                                <span className="font-mono text-sm text-slate-500 uppercase">{form.secondaryColor}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Images section */}
            {!isNew && (
                <div className="card p-6 md:p-8 mt-12 bg-slate-100 border-dashed border-2 border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span>🖼️</span> Album sưu tập ảnh cưới
                        </h3>
                        <label className={`inline-flex items-center justify-center gap-2 btn-secondary bg-white cursor-pointer px-5 py-2.5 ${uploadingImage ? 'opacity-50' : ''}`}>
                            <span className="text-xl">📤</span>
                            <span className="font-semibold text-sm">{uploadingImage ? 'Đang tải lên...' : 'Thêm nhiều ảnh'}</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                        </label>
                    </div>

                    {wedding?.images && wedding.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {wedding.images.map((img) => (
                                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                                    <img src={`http://localhost:8080${img.imageUrl}`} alt={img.caption || ''} className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                                        >
                                            Thùng rác
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-slate-200 border-dashed">
                            <span className="text-4xl block mb-3 opacity-50">📸</span>
                            <p className="text-slate-500">Chưa có ảnh nào trong album. Hãy chia sẻ những bức hình đẹp nhất của 2 bạn!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-end items-center gap-3">
                    {!isNew && !wedding?.isPublished && (
                        <button type="button" onClick={handlePublish} className="btn-secondary w-full sm:w-auto bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300">
                            🚀 Xuất bản ngay
                        </button>
                    )}
                    <button form="wedding-form" type="submit" className="btn-primary w-full sm:w-auto px-10 text-base py-2.5 shadow-md shadow-primary/20" disabled={saving}>
                        {saving ? '⏳ Đang lưu...' : isNew ? '✨ Khởi tạo thiệp' : '💾 Lưu mọi thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
