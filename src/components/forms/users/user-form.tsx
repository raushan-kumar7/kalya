import { Button, Input } from "@/components/ui";
import { User } from "@/types/auth";
import { UserInput, UserSchema } from "@/validations/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

interface UserFormProps {
  user: User;
}

export function UserForm({ user }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      first_name: user.name ?? "",
      middle_name: user.middle_name ?? "",
      last_name: user.last_name ?? "",
      gender: user.gender ?? "MALE",
      date_of_birth: user.date_of_birth ?? "",
      phone: user.phone ?? "",
    },
  });

  const onSubmit = async (data: UserInput) => {
    console.log("User input: ", data);
    reset();
  };

  const ICON_SIZE = 16;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5" noValidate>
      <div className="grid grid-cols-3 gap-3 space-y-1.5">
        <Input
          label="First Name"
          type="text"
          required
          placeholder="Enter first name"
          leadingIcon={<UserRound size={ICON_SIZE} />}
          autoComplete="firstName"
          errorMessage={errors.first_name?.message}
          {...register("first_name")}
        />
        <Input
          label="Middle Name"
          type="text"
          placeholder="Enter middle name"
          leadingIcon={<UserRound size={ICON_SIZE} />}
          autoComplete="middleName"
          errorMessage={errors.middle_name?.message}
          {...register("middle_name")}
        />
        <Input
          label="Last Name"
          type="text"
          required
          placeholder="Enter last name"
          leadingIcon={<UserRound size={ICON_SIZE} />}
          autoComplete="lastName"
          errorMessage={errors.last_name?.message}
          {...register("last_name")}
        />
      </div>

      <Button type="submit" variant="default" size="md" className="" disabled>
        Save
      </Button>
    </form>
  );
}
