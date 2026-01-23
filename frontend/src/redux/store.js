import { configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './clices/authSlice';
import tokenReducer from './clices/tokenSlice';
import userReducer from './clices/userSlice';

// Cấu hình persist - CHỈ PERSIST AUTH (user info + login status)
const authPersistConfig = {
    key: 'auth',
    version: 1,
    storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,  // Persist - lưu thông tin user
        token: tokenReducer,
        user: userReducer,            // Không persist - profile sẽ fetch lại khi cần
        // Không persist - token sẽ mất khi reload
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
