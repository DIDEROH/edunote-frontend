import { toast } from 'sonner'

export  function useNotify() {
  
    // Fonction de suppression
    const deleteToast = (text, onAction) => {
        toast.error(`Voulez-vous vraiment supprimer ${text} ?`, {
            action: {
                label: "Supprimer",
                onClick: () => {onAction();}
            },
            cancel: {
                label: "Annuler",
                onClick: () => {
                    toast.success("Suppression annulée !");
                },
            },
        });
    };


    return { deleteToast }
}
