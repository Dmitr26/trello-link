import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICard } from '../interfaces/ICard';
import { IList } from '../interfaces/IList';
import { IBoard } from '../interfaces/IBoard';
import api from '../../api/request';

interface ModalState {
    isEditModalOpen: boolean;
    cardData: ICard | null;
    boardsData: IBoard | null;
}

const initialState: ModalState = {
    isEditModalOpen: false,
    cardData: null,
    boardsData: null
};

export const fetchBoardData = createAsyncThunk(
    'modal/fetchBoardData',
    async (id: string) => {
        const response = await api.get<{ title: string, lists: IList[] }, IBoard>('/board/' + id);
        return response;
    }
);

export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<{
            cardData: ICard
        }>) => {
            state.isEditModalOpen = true;
            state.cardData = action.payload.cardData;
        },
        closeModal: (state) => {
            state.isEditModalOpen = false;
            state.cardData = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchBoardData.fulfilled, (state, action) => {
            state.boardsData = action.payload;
        });
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;