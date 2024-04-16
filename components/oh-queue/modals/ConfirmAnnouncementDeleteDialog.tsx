import {Announcement} from "@/types/QueueTypes";

import { AlertDialog, AlertDialogOverlay, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogCloseButton} from "@chakra-ui/modal";
import {Button} from "@chakra-ui/react";
import React, {useRef} from "react";

interface ConfirmAnnouncementDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmAnnouncementDeleteDialog: React.FC<ConfirmAnnouncementDeleteDialogProps> = ({isOpen, onClose, onConfirm}) => {
    const cancelRef = useRef(null);

    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete Announcement
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure you want to delete this announcement?
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button onClick={onClose} ref={cancelRef}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={onConfirm} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

export default ConfirmAnnouncementDeleteDialog;