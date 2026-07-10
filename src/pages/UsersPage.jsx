    import { useEffect, useRef, useState, useCallback } from "react";
    import { api } from "../utils/AxiosClient";
    import { useAnimations } from "../utils/animations";
    import PageHeader from "../components/elements/PageHeader";
    import { Table, TdBody, Th, Tr } from "../components/Table";
    import LoadingSkeletoon from "../components/LoadingSkeletoon";
    import { toast } from "sonner";
    import { LuSearchX, LuUserRoundCog } from "react-icons/lu";
    import { Card5, UserCard } from "../components/ui/CardsComponents";
    import Paginate from "../components/Paginate";
    import { deleteElement } from "../utils/deleteElement";
    import useShowConfirm from "../hooks/UseShowConfirm";
    import {
        CloseBtn,
        CustomBtn,
        DeleteBtn
    } from "../components/ui/ButtonsComponents";

    function UsersPage() {
        const containerRef = useRef(null);

        useAnimations(containerRef);

        const showConfirm = useShowConfirm();

        const [loading, setLoading] = useState(false);
        const [users, setUsers] = useState([]);
        const [roles, setRoles] = useState([]);

        const [isSHowUser, setIsSHowUser] = useState(false);
        const [userInfo, setUserInfo] = useState({});

        const [showRoleModal, setShowRoleModal] = useState(false);
        const [assigningRole, setAssigningRole] = useState(false);
        const [removingRole, setRemovingRole] = useState(false);
        const [selectedRole, setSelectedRole] = useState("");
        

        const [searchQuery, setSearchQuery] = useState("");
        const [debouncedQuery, setDebouncedQuery] = useState("");

        const [pagination, setPagination] = useState({
            currentPage: 1,
            lastPage: 1
        });

        const handleOpenRoleModal = () => {
            setSelectedRole("");
            setShowRoleModal(true);
        };

        const handleShowUSer = (user) => {
            setUserInfo(user);
            setSelectedRole("");
            setIsSHowUser(true);
        };

        const handleDeleteUser = async (id) => {
            deleteElement(
                "users",
                id,
                "cet utilisateur",
                showConfirm,
                {
                    onStart: () => setLoading(true),
                    onSuccess: () => {
                        fetchUsers(
                            pagination.currentPage,
                            debouncedQuery
                        );

                        setIsSHowUser(false);
                    },
                    onFinally: () => setLoading(false)
                }
            );
        };

        const handleAssignRole = async () => {
            if (!selectedRole) {
                toast.warning("Veuillez sélectionner un rôle.");
                return;
            }

            const alreadyAssigned = userInfo?.roles?.some(
                (role) => role.id === Number(selectedRole)
            );

            if (alreadyAssigned) {
                toast.info("Ce rôle est déjà attribué.");
                return;
            }

            try {
                setAssigningRole(true);

                await api.post(`/users/${userInfo.id}/roles`, {
                    role_id: selectedRole
                });

                const role = roles.find(
                    (item) => item.id === Number(selectedRole)
                );

                setUserInfo((prev) => ({
                    ...prev,
                    roles: [...(prev.roles || []), role]
                }));

                setSelectedRole("");

                fetchUsers(
                    pagination.currentPage,
                    debouncedQuery
                );

                toast.success("Rôle attribué avec succès.");
            } catch (error) {
                toast.error(
                    error?.response?.data?.message ||
                    "Erreur lors de l'attribution du rôle."
                );
            } finally {
                setAssigningRole(false);
            }
        };

        const handleRemoveRole = async (role) => {
            try {
                setRemovingRole(true);

                // Modification ici : on passe l'ID dans le corps (body) de la requête via l'option 'data'
                await api.delete(`/users/${userInfo.id}/roles`, {
                    data: { role_id: role.id }
                });

                // Met à jour l'état local du composant immédiatement
                setUserInfo((prev) => ({
                    ...prev,
                    roles: prev.roles.filter(
                        (item) => item.id !== role.id
                    )
                }));

                // Rafraîchit la liste globale en arrière-plan
                fetchUsers(
                    pagination.currentPage,
                    debouncedQuery
                );

                toast.success("Rôle supprimé avec succès.");
            } catch (error) {
                toast.error(
                    error?.message ||
                    "Erreur lors de la suppression du rôle."
                );
            } finally {
                setRemovingRole(false);
            }
        };


        const fetchUsers = useCallback(async (page = 1, query = "") => {
            setLoading(true);

            api.get(`/users?page=${page}&search=${query}`)
                .then(({ data }) => {
                    setUsers(data);

                    setPagination({
                        currentPage: data.current_page,
                        lastPage: data.last_page
                    });
                })
                .catch((error) =>
                    toast.error(
                        error.message ||
                        "Erreur lors du chargement des utilisateurs"
                    )
                )
                .finally(() => setLoading(false));
        }, []);

        const fetchRoles = async () => {
            try {
                const { data } = await api.get("/roles");
                setRoles(data);
            } catch (error) {
                toast.error("Impossible de charger les rôles.");
            }
        };

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedQuery(searchQuery);
                setIsSHowUser(false);
            }, 400);

            return () => clearTimeout(handler);
        }, [searchQuery]);

        useEffect(() => {
            fetchUsers(1, debouncedQuery);
        }, [debouncedQuery, fetchUsers]);

        useEffect(() => {
            fetchRoles();
        }, []);

        useEffect(() => {
            if (!isSHowUser) {
                setShowRoleModal(false);
            }
        }, [isSHowUser]);

        return (
            <div ref={containerRef}>
                <PageHeader
                    title="Gestion des Utilisateurs"
                    subtitle="Liste complète des utilisateurs inscrits et configuration de leurs accès."
                    onSearch={(value) => setSearchQuery(value)}
                    searchPlaceholder="Rechercher un utilisateur..."
                />

                <section className="p-4">
                    {loading ? (
                        <LoadingSkeletoon />
                    ) : !users?.data || users.data.length === 0 ? (
                        <Card5 icon={LuSearchX}>
                            Aucun utilisateur trouvé.
                        </Card5>
                    ) : isSHowUser ? (
                        <UserCard
                            user={userInfo}
                            onClose={() => setIsSHowUser(false)}
                            onDelete={() => handleDeleteUser(userInfo.id)}
                        >
                            
                            <CustomBtn
                                icon={LuUserRoundCog}
                                colorText="text-green-700"
                                toolText="Gérer les rôles"
                                onAction={handleOpenRoleModal}
                            />

                            <DeleteBtn
                                onAction={() =>
                                    handleDeleteUser(userInfo.id)
                                }
                            />

                            <CloseBtn
                                onAction={() => setIsSHowUser(false)}
                            />
                        </UserCard>
                    ) : (
                        <>
                            <Table>
                                <Table.Head>
                                    <Th className="font-bold">#</Th>
                                    <Th>Nom complet</Th>
                                    <Th>Contact</Th>
                                    <Th>Email</Th>
                                </Table.Head>

                                <Table.Body>
                                    {users.data.map((user, index) => (
                                        <Tr
                                            className="cursor-pointer"
                                            key={user.id}
                                            onAction={() =>
                                                handleShowUSer(user)
                                            }
                                        >
                                            <TdBody>
                                                {((pagination.currentPage - 1) * 25) +
                                                    index +
                                                    1}
                                            </TdBody>

                                            <TdBody className="font-semibold">
                                                {user?.first_name}{" "}
                                                {user?.last_name}
                                            </TdBody>

                                            <TdBody>
                                                {user?.phone ||
                                                    "Non renseigné"}
                                            </TdBody>

                                            <TdBody>
                                                {user?.email}
                                            </TdBody>
                                        </Tr>
                                    ))}
                                </Table.Body>
                            </Table>

                            <div className="mt-4 flex justify-center">
                                <Paginate
                                    currentPage={pagination.currentPage}
                                    lastPage={pagination.lastPage}
                                    onPageChange={(page) =>
                                        fetchUsers(
                                            page,
                                            debouncedQuery
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}

                    {showRoleModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

                                <div className="border-b p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">
                                                Gestion des rôles
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {userInfo?.first_name} {userInfo?.last_name}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setShowRoleModal(false)}
                                            className="text-2xl text-slate-500 hover:text-slate-700"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 p-6">

                                    <div>
                                        <h3 className="mb-3 font-semibold text-slate-700">
                                            Rôles attribués
                                        </h3>

                                        <div className="flex flex-wrap gap-3">
                                            {userInfo?.roles?.length > 0 ? (
                                                userInfo.roles.map((role) => (
                                                    <div
                                                        key={role.id}
                                                        className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2"
                                                    >
                                                        <span className="text-sm font-medium text-blue-700">
                                                            {role.name}
                                                        </span>

                                                        <button
                                                            disabled={removingRole}
                                                            onClick={() => handleRemoveRole(role)}
                                                            className="text-red-500 transition hover:text-red-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-500">
                                                    Aucun rôle attribué.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Ajouter un rôle
                                        </label>

                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Sélectionner un rôle
                                            </option>

                                            {roles
                                                .filter(
                                                    (role) =>
                                                        !userInfo?.roles?.some(
                                                            (userRole) =>
                                                                userRole.id === role.id
                                                        )
                                                )
                                                .map((role) => (
                                                    <option
                                                        key={role.id}
                                                        value={role.id}
                                                    >
                                                        {role.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t p-6">
                                    <button
                                        onClick={() => setShowRoleModal(false)}
                                        className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700"
                                    >
                                        Fermer
                                    </button>

                                    <button
                                        disabled={assigningRole}
                                        onClick={handleAssignRole}
                                        className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {assigningRole
                                            ? "Attribution..."
                                            : "Ajouter le rôle"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        );
    }

    export default UsersPage;