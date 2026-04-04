from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
OUT = Path(__file__).with_name("jump-process-example.png")


def main() -> None:
    fig, (ax_text, ax) = plt.subplots(
        2,
        1,
        figsize=(6.2, 4.2),
        dpi=180,
        gridspec_kw={"height_ratios": [1, 2.2]},
        constrained_layout=True,
    )

    ax_text.axis("off")
    ax_text.text(
        0.5,
        0.68,
        r"$Y_t = 0 \quad (t<1)$",
        ha="center",
        va="center",
        fontsize=18,
    )
    ax_text.text(
        0.5,
        0.30,
        r"$Y_t = 1 \quad (t\geq 1)$",
        ha="center",
        va="center",
        fontsize=18,
    )

    ax.plot([0, 1], [0, 0], color="#18c8d8", linewidth=2.6)
    ax.plot([1, 2], [1, 1], color="#18c8d8", linewidth=2.6)
    ax.plot(
        1,
        0,
        marker="o",
        markersize=7,
        markerfacecolor="white",
        markeredgewidth=2,
        markeredgecolor="#18c8d8",
    )
    ax.plot(1, 1, marker="o", markersize=7, color="#18c8d8")
    ax.axvline(1, color="#8aa0a6", linestyle="--", linewidth=1.1)

    ax.set_xlim(0, 2)
    ax.set_ylim(-0.15, 1.2)
    ax.set_xticks([1])
    ax.set_xticklabels(["t=1"])
    ax.set_yticks([0, 1])
    ax.set_xlabel("t")
    ax.set_ylabel(r"$Y_t$")

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(False)

    fig.savefig(OUT, bbox_inches="tight", facecolor="white")
    plt.close(fig)


if __name__ == "__main__":
    main()
