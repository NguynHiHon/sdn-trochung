// import React, { useState, useEffect } from 'react';
// import cloudinaryService from '../../../../services/cloudinaryService';
// import { useNavigate } from 'react-router-dom';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Box from '@mui/material/Box';
// import Grid from '@mui/material/GridLegacy';
// import Paper from '@mui/material/Paper';
// import Typography from '@mui/material/Typography';
// import CircularProgress from '@mui/material/CircularProgress';
// import FormHelperText from '@mui/material/FormHelperText';
// import useNotifications from '../../hooks/useNotifications/useNotifications';
// import { getAllProductTypes, getProductType } from '../../../../services/categoryService';
// import { getBrands } from '../../../../services/productService';
// import MenuItem from '@mui/material/MenuItem';
// import Select from '@mui/material/Select';
// import InputLabel from '@mui/material/InputLabel';
// import FormControl from '@mui/material/FormControl';
// import Divider from '@mui/material/Divider';
// import ProductImagePicker from './ProductImagePicker';
// import VariantManager from './VariantManager';
// import Chip from '@mui/material/Chip';
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';

// const DEFAULT_INITIAL = {};

// /* Quill toolbar modules */
// const QUILL_MODULES = {
//   toolbar: [
//     [{ header: [1, 2, 3, false] }],
//     ['bold', 'italic', 'underline', 'strike'],
//     [{ color: [] }, { background: [] }],
//     [{ list: 'ordered' }, { list: 'bullet' }],
//     [{ align: [] }],
//     ['blockquote'],
//     ['link', 'image'],
//     ['clean'],
//   ],
// };

// const QUILL_FORMATS = [
//   'header', 'bold', 'italic', 'underline', 'strike',
//   'color', 'background', 'list', 'align',
//   'blockquote', 'link', 'image',
// ];

// export default function ProductForm({ initial = DEFAULT_INITIAL, onSubmit }) {
//   const notif = useNotifications();
//   const navigate = useNavigate();


//   const [name, setName] = useState(initial.name || '');
//   const [price, setPrice] = useState(initial.price ?? '');
//   const [stock, setStock] = useState(initial.stock ?? 0);
//   const [productTypeId, setProductTypeId] = useState(() => {
//     if (!initial.productTypeId) return '';
//     return typeof initial.productTypeId === 'string' ? initial.productTypeId : (initial.productTypeId._id || '');
//   });
//   const [attributes, setAttributes] = useState(initial.attributes || []);
//   const [description, setDescription] = useState(initial.description || '');
//   const [warranty, setWarranty] = useState(initial.warranty || '');
//   const [brand, setBrand] = useState(initial.brand || '');
//   const [brandOptions, setBrandOptions] = useState([]);

//   // Variant support
//   const [hasVariants, setHasVariants] = useState(initial.hasVariants || false);
//   const [variants, setVariants] = useState(initial.variants || []);

//   const [files, setFiles] = useState([]);
//   // imageUrls is an array of objects: { id, src, local?: boolean }
//   const [imageUrls, setImageUrls] = useState((initial.images || []).map((u, i) => ({ id: `init-${i}`, src: u, local: false })));
//   const [defaultUrl, setDefaultUrl] = useState(initial.defaultImageUrl || null);
//   const [uploading, setUploading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [productTypes, setProductTypes] = useState([]);
//   // status per previewId (pending | uploaded | failed)
//   const [imageStatuses, setImageStatuses] = useState({});

//   // Retry upload for a single previewId
//   const retryUpload = async (previewId) => {
//     const target = files.find(f => f.previewId === previewId);
//     if (!target) {
//       notif.show('Không tìm thấy file để thử lại', { severity: 'error' });
//       return;
//     }
//     setImageStatuses(prev => ({ ...prev, [previewId]: 'pending' }));
//     try {
//       const res = await cloudinaryService.uploadFileToCloudinary(target.file, 'tunashop');
//       if (res && (res.secure_url || res.url)) {
//         const url = res.secure_url || res.url;
//         setImageUrls(prev => prev.map(p => p.id === previewId ? ({ id: `remote-${Date.now()}`, src: url, local: false }) : p));
//         setImageStatuses(prev => ({ ...prev, [previewId]: 'uploaded' }));
//         setFiles(prev => prev.filter(f => f.previewId !== previewId));
//         setDefaultUrl(prev => prev || url);
//         notif.show('Tải ảnh thành công', { severity: 'success' });
//       } else {
//         throw new Error('Cloudinary trả về dữ liệu không hợp lệ');
//       }
//     } catch (err) {
//       setImageStatuses(prev => ({ ...prev, [previewId]: 'failed' }));
//       notif.show(`Tải lại ảnh thất bại: ${err.message || err}`, { severity: 'error' });
//     }
//   };

//   const retryAllFailed = async () => {
//     const failedIds = Object.keys(imageStatuses).filter(k => imageStatuses[k] === 'failed');
//     for (const id of failedIds) {
//       // sequential retries keep UI simple

//       await retryUpload(id);
//     }
//   };

//   // track broken images to show placeholder when <img> fails to load




//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getAllProductTypes();
//         setProductTypes(Array.isArray(res) ? res : res.data || []);
//       } catch (err) {
//         notif.show('Failed to load product types. ' + (err.message || ''), { severity: 'error' });
//       }
//       try {
//         const bRes = await getBrands();
//         setBrandOptions(Array.isArray(bRes) ? bRes : bRes.data || []);
//       } catch (err) {
//         console.error('Failed to load brands, using default list.', err);
//         setBrandOptions(['Victor', 'Yonex', 'Li-Ning', 'Mizuno', 'Kumbo', 'Acer']);
//       }
//     })();
//   }, []);

//   // when productTypeId changes, fetch its attributes (predefined)
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       if (!productTypeId) {
//         setAttributes([]);
//         return;
//       }
//       try {
//         const res = await getProductType(productTypeId);
//         const pt = res && (res.data || res);
//         const attrs = (pt?.listAttributeIds || [])
//           .filter(attr => attr.name?.toLowerCase() !== 'brand') // brand is a separate field now
//           .map(attr => ({
//             attributeId: attr._id,
//             name: attr.name_vi || attr.name,
//             type: attr.type,
//             options: (attr.options || []).map(opt => {
//               if (opt && typeof opt === 'object') return String(opt.value ?? opt._id ?? JSON.stringify(opt));
//               return String(opt);
//             }),
//             value: ''
//           }));

//         // if editing and initial attributes provided, populate values (normalize to string)
//         if (initial.attributes && initial.attributes.length) {
//           for (const a of attrs) {
//             const existing = initial.attributes.find(x => String(x.attributeId) === String(a.attributeId) || x.attributeId === a.attributeId || (x.attributeId && x.attributeId._id === a.attributeId));
//             if (existing) a.value = existing.value !== undefined && existing.value !== null ? String(existing.value) : '';
//           }
//         }

//         if (!cancelled) {
//           // avoid unnecessary state updates that cause re-renders loops
//           setAttributes(prev => {
//             try {
//               if (JSON.stringify(prev) === JSON.stringify(attrs)) return prev;
//             } catch (e) {
//               notif.show('Error comparing attribute lists: ' + (e.message || ''), { severity: 'error' });
//             }
//             return attrs;
//           });
//         }
//       } catch (err) {
//         console.error('failed to load product type', err);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [productTypeId]);

//   useEffect(() => {

//     // If user already selected files locally, do not clobber previews from local selection
//     if (files.length) {
//       return;
//     }

//     // images may come as array of URLs (initial.images) or as imageIds populated from backend (initial.imageIds)
//     const urls = (initial.images && Array.isArray(initial.images) && initial.images.length)
//       ? initial.images.map((u, i) => ({ id: `init-${i}`, src: u, local: false }))
//       : (initial.imageIds && Array.isArray(initial.imageIds))
//         ? initial.imageIds.map((i, idx) => ({ id: `initid-${idx}`, src: i.url_Image || i.secure_url || i.url, local: false }))
//         : [];

//     setImageUrls(prev => {
//       try {
//         if (JSON.stringify(prev) === JSON.stringify(urls)) return prev;
//       } catch (e) {
//         notif.show('Error comparing image URL lists: ' + (e.message || ''), { severity: 'error' });
//         // fallthrough if stringify fails
//       }
//       return urls;
//     });

//     const def = initial.defaultImageUrl || (initial.defaultImageId ? (initial.defaultImageId.url_Image || initial.defaultImageId.secure_url || initial.defaultImageId.url) : null);
//     setDefaultUrl(prev => prev === def ? prev : def);

//     if (initial.productTypeId) {
//       const ptid = typeof initial.productTypeId === 'string' ? initial.productTypeId : (initial.productTypeId._id || '');
//       setProductTypeId(prev => prev === ptid ? prev : ptid);
//     }
//   }, [initial, files]);

//   // Sync other form fields when `initial` changes
//   useEffect(() => {
//     setName(initial.name || '');
//     setPrice(initial.price ?? '');
//     setStock(initial.stock ?? 0);
//     setBrand(initial.brand || '');
//     setHasVariants(initial.hasVariants || false);
//     setVariants(initial.variants || []);
//     // Don't set attributes here — the productTypeId effect handles building
//     // proper attribute objects with name/type/options and populating values from initial
//     setDescription(initial.description || '');
//     setWarranty(initial.warranty || '');
//     const ptid = initial.productTypeId ? (typeof initial.productTypeId === 'string' ? initial.productTypeId : (initial.productTypeId._id || '')) : '';
//     setProductTypeId(prev => prev === ptid ? prev : ptid);
//     const def = initial.defaultImageUrl || (initial.defaultImageId ? (initial.defaultImageId.url_Image || initial.defaultImageId.secure_url || initial.defaultImageId.url) : null);
//     setDefaultUrl(prev => prev === def ? prev : def);
//   }, [initial]);



//   const uploadAll = async () => {
//     if (!files.length) return { uploadedUrls: [], hadFailures: false, finalImageUrls: imageUrls };
//     setUploading(true);
//     const uploadedUrls = [];
//     let hadFailures = false;

//     // Work on a local copy of imageUrls so we can return the final list deterministically
//     let newList = Array.isArray(imageUrls) ? imageUrls.slice() : [];

//     // files is array of {file, previewId}
//     for (const item of files) {
//       const f = item.file;
//       // mark pending by previewId
//       setImageStatuses(prev => ({ ...prev, [item.previewId]: 'pending' }));
//       try {
//         const res = await cloudinaryService.uploadFileToCloudinary(f, 'tunashop');
//         if (res && (res.secure_url || res.url)) {
//           const url = res.secure_url || res.url;
//           uploadedUrls.push(url);

//           const idx = newList.findIndex(p => p.id === item.previewId);
//           if (idx !== -1) {
//             const wasDefault = (defaultUrl === newList[idx].src);
//             newList[idx] = ({ id: `remote-${Date.now()}-${idx}`, src: url, local: false });
//             if (wasDefault) setDefaultUrl(url);
//           } else {
//             // If preview not found (edge case), append the uploaded URL
//             newList.push({ id: `remote-${Date.now()}-${uploadedUrls.length}`, src: url, local: false });
//             if (!defaultUrl) setDefaultUrl(url);
//           }

//           setImageStatuses(prev => ({ ...prev, [item.previewId]: 'uploaded' }));
//         } else {
//           hadFailures = true;
//           setImageStatuses(prev => ({ ...prev, [item.previewId]: 'failed' }));
//         }
//       } catch (err) {
//         hadFailures = true;
//         console.error('upload error', err);
//         setImageStatuses(prev => ({ ...prev, [item.previewId]: 'failed' }));
//         notif.show(`Tải ảnh thất bại: ${err.message || err}`, { severity: 'error' });
//       }
//     }

//     // Apply final list once
//     setImageUrls(newList);
//     setUploading(false);

//     if (uploadedUrls.length) {
//       // if defaultUrl is not set, use first uploaded
//       setDefaultUrl(prev => prev || uploadedUrls[0] || null);
//     }

//     // If all uploads succeeded, clear files; otherwise keep files so user can retry/remove failed ones
//     if (!hadFailures) setFiles([]);

//     return { uploadedUrls, hadFailures, finalImageUrls: newList };
//   };

//   const validate = () => {
//     const e = {};
//     if (!name || !name.trim()) e.name = 'Tên là bắt buộc';
//     if (!productTypeId || !productTypeId.trim()) e.productTypeId = 'Loại sản phẩm là bắt buộc';
//     const p = Number(price);
//     if (Number.isNaN(p) || p < 0) e.price = 'Giá phải là số không âm';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const isHttpUrl = (s) => {
//     try {
//       const u = new URL(s);
//       return u.protocol === 'http:' || u.protocol === 'https:';
//     } catch (e) {
//       notif.show('Error validating URL: ' + (e.message || ''), { severity: 'error' });
//       return false;
//     }
//   };

//   // Debug imageUrls changes to help investigate missing previews


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     const { uploadedUrls, hadFailures, finalImageUrls } = await uploadAll();

//     if (hadFailures) {
//       notif.show('Một số ảnh tải lên thất bại. Vui lòng thử lại hoặc loại bỏ ảnh không hợp lệ.', { severity: 'error' });
//       return;
//     }

//     // Use the deterministic finalImageUrls returned from uploadAll (fall back to state)
//     const finalImgs = Array.isArray(finalImageUrls) ? finalImageUrls : imageUrls;

//     // final sanity: ensure all imageUrls are http(s) before sending
//     const invalid = finalImgs.filter(p => !isHttpUrl(p.src));
//     if (invalid.length) {
//       notif.show('Có ảnh chưa được tải lên hoặc không hợp lệ. Vui lòng tải lại ảnh hoặc loại bỏ chúng.', { severity: 'error' });
//       return;
//     }

//     // Determine default image to send (prefer http(s) defaultUrl, otherwise first http image)
//     let defaultToUse = defaultUrl;
//     if (!isHttpUrl(defaultToUse)) {
//       const firstHttp = finalImgs.find(p => isHttpUrl(p.src));
//       defaultToUse = firstHttp ? firstHttp.src : null;
//     }

//     const payload = {
//       name: name.trim(),
//       brand: brand.trim(),
//       price: Number(price),
//       stock: hasVariants ? variants.reduce((sum, v) => sum + (v.stock || 0), 0) : Number(stock),
//       productTypeId: productTypeId.trim(),
//       attributes: attributes.map(a => ({ attributeId: a.attributeId, value: a.value })),
//       hasVariants,
//       variants: variants, // Always keep variants, just toggle hasVariants flag
//       description: description.trim(),
//       warranty: warranty ? warranty.trim() : undefined,
//       images: finalImgs.map(p => p.src),
//       defaultImageUrl: defaultToUse,
//     };

//     try {
//       // Avoid printing large or unexpected HTML payloads. Log a small summary instead.
//       const safePayloadSummary = {
//         name: payload.name,
//         price: payload.price,
//         productTypeId: payload.productTypeId,
//         imagesCount: Array.isArray(payload.images) ? payload.images.length : 0,
//         defaultImageUrl: payload.defaultImageUrl ? (String(payload.defaultImageUrl).slice(0, 120) + (String(payload.defaultImageUrl).length > 120 ? '...' : '')) : null,
//       };

//       // Basic check to reject clearly invalid image content (e.g., HTML returned in place of a URL)
//       const badImage = (payload.images || []).find(i => (typeof i === 'string') && (/^\s*</.test(i)));
//       if (badImage) {
//         console.error('Detected invalid image value (looks like HTML) in payload:', badImage);
//         notif.show('Phát hiện dữ liệu ảnh không hợp lệ. Kiểm tra quá trình upload hoặc signature.', { severity: 'error' });
//         return;
//       }

//       await onSubmit(payload);
//     } catch (err) {
//       console.error('Save product failed. uploadedUrls:', uploadedUrls, 'imageUrls:', imageUrls, err);
//       const details = err?.details || err?.response?.data?.details;
//       if (Array.isArray(details) && details.length) {
//         notif.show(details.join('; '), { severity: 'error' });
//       } else {
//         notif.show(`Lưu thất bại: ${err?.message || (typeof err === 'string' ? err : err)}`, { severity: 'error' });
//       }
//       // handled here
//       return;
//     }
//   };

//   const handleChangeAttributeValue = (attributeId, value) => {
//     // Ensure robust comparison in case attributeId is string or object-like
//     setAttributes(prev => prev.map(a => String(a.attributeId) === String(attributeId) ? ({ ...a, value }) : a));
//   };

//   // Attributes are predefined by product type; no add/remove in this form


//   return (
//     <Box component="form" onSubmit={handleSubmit}>
//       {/* ── Section 1: Basic Info ── */}
//       <Paper sx={{ p: 3, mb: 2.5 }}>
//         <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
//           Thông tin cơ bản
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <TextField label="Tên sản phẩm" fullWidth value={name} onChange={e => setName(e.target.value)} error={!!errors.name} helperText={errors.name} required />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <FormControl fullWidth error={!!errors.productTypeId}>
//               <InputLabel id="product-type-label">Loại sản phẩm *</InputLabel>
//               <Select
//                 labelId="product-type-label"
//                 value={productTypeId}
//                 onChange={(e) => setProductTypeId(e.target.value)}
//                 label="Loại sản phẩm *"
//               >
//                 <MenuItem value="">-- Chọn --</MenuItem>
//                 {productTypes && productTypes.map(pt => (
//                   <MenuItem key={pt._id} value={pt._id}>{pt.name}</MenuItem>
//                 ))}
//               </Select>
//               {errors.productTypeId && <FormHelperText>{errors.productTypeId}</FormHelperText>}
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <FormControl fullWidth>
//               <InputLabel id="brand-label">Thương hiệu</InputLabel>
//               <Select
//                 labelId="brand-label"
//                 value={brand}
//                 onChange={(e) => setBrand(e.target.value)}
//                 label="Thương hiệu"
//               >
//                 <MenuItem value="">-- Chọn --</MenuItem>
//                 {brandOptions.map(b => (
//                   <MenuItem key={b} value={b}>{b}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={6} sm={6} md={3}>
//             <TextField label="Giá (VNĐ)" type="number" fullWidth value={price} onChange={e => setPrice(e.target.value)} error={!!errors.price} helperText={errors.price} required />
//           </Grid>
//           <Grid item xs={6} sm={6} md={3}>
//             <TextField
//               label={hasVariants ? "Tổng tồn kho" : "Tồn kho"}
//               type="number"
//               fullWidth
//               value={hasVariants ? variants.reduce((sum, v) => sum + (v.stock || 0), 0) : stock}
//               onChange={e => setStock(e.target.value)}
//               disabled={hasVariants}
//               helperText={hasVariants ? "Tự động tính từ số lượng biến thể" : ""}
//             />
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* ── Section 2: Images ── */}
//       <Paper sx={{ p: 3, mb: 2.5 }}>
//         <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
//           Hình ảnh sản phẩm
//         </Typography>
//         <ProductImagePicker
//           files={files}
//           setFiles={setFiles}
//           imageUrls={imageUrls}
//           setImageUrls={setImageUrls}
//           defaultUrl={defaultUrl}
//           setDefaultUrl={setDefaultUrl}
//           imageStatuses={imageStatuses}
//           retryUpload={retryUpload}
//         />
//         {Object.values(imageStatuses).some(s => s === 'failed') && (
//           <Box sx={{ mt: 1.5 }}>
//             <Button size="small" variant="outlined" color="warning" onClick={retryAllFailed}>Thử lại ảnh lỗi</Button>
//           </Box>
//         )}
//         {files.length > 0 && (
//           <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
//             {files.map(f => <Chip key={f.previewId} label={f.file?.name || f.name || 'file'} size="small" variant="outlined" />)}
//           </Box>
//         )}
//       </Paper>

//       {/* ── Section 3: Variants (Size/Color) ── */}
//       <Paper sx={{ p: 3, mb: 2.5 }}>
//         <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
//           Biến thể sản phẩm
//         </Typography>
//         <VariantManager
//           variants={variants}
//           onChange={setVariants}
//           hasVariants={hasVariants}
//           onToggleVariants={setHasVariants}
//         />
//       </Paper>

//       {/* ── Section 4: Description & Warranty ── */}
//       <Paper sx={{ p: 3, mb: 2.5 }}>
//         <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
//           Mô tả & Bảo hành
//         </Typography>
//         <Grid container spacing={2}>

//           <Grid item xs={12} md={12}>
//             <TextField label="Bảo hành" fullWidth value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="VD: 12 tháng" />
//           </Grid>
//           <Grid item xs={12} md={12}>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Mô tả sản phẩm</Typography>
//             <Box sx={{
//               '& .ql-container': { minHeight: 200, fontSize: '0.95rem' },
//               '& .ql-editor': { minHeight: 200 },
//               '& .ql-toolbar': { borderRadius: '8px 8px 0 0', bgcolor: '#fafafa' },
//               '& .ql-container.ql-snow': { borderRadius: '0 0 8px 8px' },
//             }}>
//               <ReactQuill
//                 theme="snow"
//                 value={description}
//                 onChange={setDescription}
//                 modules={QUILL_MODULES}
//                 formats={QUILL_FORMATS}
//                 placeholder="Nhập mô tả sản phẩm (hỗ trợ in đậm, in nghiêng, chèn ảnh...)"
//               />
//             </Box>
//           </Grid>

//         </Grid>
//       </Paper>

//       {/* ── Section 4: Attributes (only shown when a product type is selected and has attrs) ── */}
//       {attributes.length > 0 && (
//         <Paper sx={{ p: 3, mb: 2.5 }}>
//           <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
//             Thuộc tính
//           </Typography>
//           <Grid container spacing={2}>
//             {attributes.map((a) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={a.attributeId}>
//                 {a.type === 'select' ? (
//                   <FormControl fullWidth size="small">
//                     <InputLabel>{a.name}</InputLabel>
//                     <Select
//                       value={a.value || ''}
//                       onChange={(e) => handleChangeAttributeValue(a.attributeId, e.target.value)}
//                       label={a.name}
//                     >
//                       <MenuItem value="">-- Chọn --</MenuItem>
//                       {a.options && a.options.map(opt => {
//                         const optValue = (typeof opt === 'object') ? (opt.value ?? opt._id ?? JSON.stringify(opt)) : String(opt);
//                         const optLabel = (typeof opt === 'object') ? (opt.label ?? opt.name ?? optValue) : opt;
//                         return (<MenuItem key={optValue} value={optValue}>{optLabel}</MenuItem>);
//                       })}
//                     </Select>
//                   </FormControl>
//                 ) : (
//                   <TextField label={a.name} size="small" fullWidth value={a.value || ''} onChange={(e) => handleChangeAttributeValue(a.attributeId, e.target.value)} />
//                 )}
//               </Grid>
//             ))}
//           </Grid>
//         </Paper>
//       )}

//       {/* ── Actions ── */}
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
//         <Button variant="outlined" onClick={() => navigate('/management/products')} sx={{ minWidth: 100 }}>Hủy</Button>
//         <Button type="submit" variant="contained" disabled={uploading} sx={{ minWidth: 120 }}>
//           {uploading ? <CircularProgress size={20} /> : 'Lưu sản phẩm'}
//         </Button>
//       </Box>
//     </Box>
//   );
// }
