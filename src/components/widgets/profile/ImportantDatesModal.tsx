"use client";

import { useCallback, useState } from "react";

import { BottomSheetModal, DiscardDialog } from "~components/modal";
import ImportantDatesForm from "~components/widgets/profile/ImportantDatesForm";
import { useCouple } from "~queries/couple/use-couple";
import { useUpdateCoupleDates } from "~queries/couple/use-update-couple-dates";
import { usePartnerProfile } from "~queries/profile/use-partner-profile";
import { useCurrentUser } from "~queries/user/use-current-user";
import { useUpdateUserBirthday } from "~queries/user/use-update-user-birthday";

export interface ImportantDatesModalProps {
    open: boolean;
    onClose: () => void;
}

// Outer-модалка: тянет couple + me + partner данные, передаёт inner-форме
// initial values. Запускает соответствующие мутации в зависимости от того,
// какие поля изменились (couple-dates vs own-birthday — разные RLS-пути).
const ImportantDatesModal = ({ open, onClose }: ImportantDatesModalProps) => {
    const { data: couple } = useCouple();
    const { data: me } = useCurrentUser();
    const { data: partner } = usePartnerProfile();
    const updateCoupleDates = useUpdateCoupleDates();
    const updateUserBirthday = useUpdateUserBirthday();

    const [isDirty, setIsDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const requestClose = useCallback(() => {
        if (isDirty) {
            setShowDiscard(true);
            return;
        }
        onClose();
    }, [isDirty, onClose]);

    const handleSubmit = useCallback(
        async (payload: {
            acquaintanceDate: string | null;
            relationshipStartDate: string | null;
            ownBirthday: string | null;
        }) => {
            const initialCoupleAcq = couple?.acquaintanceDate ?? null;
            const initialCoupleRel = couple?.relationshipStartDate ?? null;
            const initialOwnBday = me?.birthday ?? null;

            const coupleChanged =
                payload.acquaintanceDate !== initialCoupleAcq ||
                payload.relationshipStartDate !== initialCoupleRel;
            const birthdayChanged = payload.ownBirthday !== initialOwnBday;

            // Запускаем только нужные мутации. Если couple-даты не менялись —
            // лишний DELETE+UPDATE+seed (потенциально destructive для
            // anniversary). Аналогично для birthday.
            if (coupleChanged) {
                await updateCoupleDates.mutateAsync({
                    acquaintanceDate: payload.acquaintanceDate,
                    relationshipStartDate: payload.relationshipStartDate,
                });
            }
            if (birthdayChanged) {
                await updateUserBirthday.mutateAsync({
                    birthday: payload.ownBirthday,
                });
            }
            onClose();
        },
        [couple, me, onClose, updateCoupleDates, updateUserBirthday],
    );

    const submitting =
        updateCoupleDates.isPending || updateUserBirthday.isPending;

    // me может быть null лишь во время начального hydration (Layout
    // гарантирует наличие user). couple — null пока не подгрузился; форма
    // в этом случае рендерится с пустыми defaults и reset'ится по приходу.
    if (!me) return null;

    return (
        <>
            <BottomSheetModal
                open={open}
                onClose={requestClose}
                ariaLabel="важные даты — редактирование"
            >
                <ImportantDatesForm
                    initial={{
                        acquaintanceDate: couple?.acquaintanceDate ?? null,
                        relationshipStartDate:
                            couple?.relationshipStartDate ?? null,
                        ownBirthday: me.birthday,
                    }}
                    partnerName={partner?.displayName ?? null}
                    partnerBirthday={partner?.birthday ?? null}
                    onSubmit={handleSubmit}
                    onCancel={requestClose}
                    submitting={submitting}
                    onDirtyChange={setIsDirty}
                />
            </BottomSheetModal>
            <DiscardDialog
                open={showDiscard}
                onConfirm={() => {
                    setShowDiscard(false);
                    onClose();
                }}
                onCancel={() => setShowDiscard(false)}
            />
        </>
    );
};

export default ImportantDatesModal;
