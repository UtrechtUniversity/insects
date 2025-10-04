# Insect_Detect_classification_v2 > 2025-10-04 10:06am
https://universe.roboflow.com/insect-recognizer/insect_detect_classification_v2-sgyqt

Provided by a Roboflow user
License: BY-NC-SA 4.0

# Overview

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.8325384.svg)](https://doi.org/10.5281/zenodo.8325384)

[![DOI PLOS ONE](https://img.shields.io/badge/PLOS%20ONE-10.1371%2Fjournal.pone.0295474-BD3094)](https://doi.org/10.1371/journal.pone.0295474)

The **Insect_Detect_classification_v2** dataset contains mainly images of various insects sitting on or flying above an artificial flower platform. All images were automatically recorded with the [Insect Detect](https://maxsitt.github.io/insect-detect-docs/) DIY camera trap, a hardware combination of the Luxonis OAK-1, Raspberry Pi Zero 2 W and PiJuice Zero pHAT for automated insect monitoring.

Most of the images were captured by camera traps deployed at different sites in 2023. For some classes (e.g. ant, bee_bombus, beetle_cocci, bug, bug_grapho, hfly_eristal, hfly_myathr, hfly_syrphus) additional images were captured with a lab setup of the camera trap. For some classes (e.g. bee_apis, fly, hfly_episyr, wasp) images from the [first](https://universe.roboflow.com/maximilian-sittinger/insect_detect_classification) dataset version were transferred to this dataset.

The images in this dataset from Roboflow are automatically compressed, which decreases model accuracy when used for training. Therefore it is recommended to use the uncompressed [Zenodo](https://doi.org/10.5281/zenodo.8325383) version and split the dataset into train/val/test subsets in the provided [training notebook](https://colab.research.google.com/github/maxsitt/insect-detect-ml/blob/main/notebooks/YOLOv5_classification_training.ipynb).

---

## Classes

This dataset contains the following 27 classes:

- **ant** ([Formicidae](https://en.wikipedia.org/wiki/Ant))
- **bee** ([Anthophila](https://en.wikipedia.org/wiki/Bee) excluding *Apis mellifera* and *Bombus* sp.)
- **bee_apis** ([*Apis mellifera*](https://en.wikipedia.org/wiki/Western_honey_bee))
- **bee_bombus** ([*Bombus* sp.](https://en.wikipedia.org/wiki/Bumblebee))
- **beetle** ([Coleoptera](https://en.wikipedia.org/wiki/Beetle) excluding Coccinellidae and some Oedemeridae)
- **beetle_cocci** ([Coccinellidae](https://en.wikipedia.org/wiki/Coccinellidae))
- **beetle_oedem** (visually distinct [Oedemeridae](https://en.wikipedia.org/wiki/Oedemeridae))
- **bug** ([Heteroptera](https://en.wikipedia.org/wiki/Heteroptera) excluding *Graphosoma italicum*)
- **bug_grapho** ([*Graphosoma italicum*](https://en.wikipedia.org/wiki/Graphosoma_italicum))
- **fly** ([Brachycera](https://en.wikipedia.org/wiki/Brachycera) excluding Empididae, Sarcophagidae, Syrphidae and small Brachycera)
- **fly_empi** ([Empididae](https://en.wikipedia.org/wiki/Empididae))
- **fly_sarco** (visually distinct [Sarcophagidae](https://en.wikipedia.org/wiki/Flesh_fly))
- **fly_small** (small [Brachycera](https://en.wikipedia.org/wiki/Brachycera))
- **hfly_episyr** (hoverfly [*Episyrphus balteatus*](https://en.wikipedia.org/wiki/Episyrphus_balteatus))
- **hfly_eristal** (hoverfly [*Eristalis* sp.](https://en.wikipedia.org/wiki/Eristalis), mainly [*Eristalis tenax*](https://en.wikipedia.org/wiki/Eristalis_tenax))
- **hfly_eupeo** (mainly hoverfly [*Eupeodes corollae*](https://en.wikipedia.org/wiki/Eupeodes_corollae) and [*Scaeva pyrastri*](https://en.wikipedia.org/wiki/Scaeva_pyrastri))
- **hfly_myathr** (hoverfly [*Myathropa florea*](https://en.wikipedia.org/wiki/Myathropa_florea))
- **hfly_sphaero** (hoverfly [*Sphaerophoria* sp.](https://en.wikipedia.org/wiki/Sphaerophoria), mainly [*Sphaerophoria scripta*](https://en.wikipedia.org/wiki/Sphaerophoria_scripta))
- **hfly_syrphus** (mainly hoverfly [*Syrphus* sp.](https://en.wikipedia.org/wiki/Syrphus))
- **lepi** ([Lepidoptera](https://en.wikipedia.org/wiki/Lepidoptera))
- **none_bg** (images with no insect - background (platform))
- **none_bird** (images with no insect - bird sitting on platform)
- **none_dirt** (images with no insect - leaves and other plant material, bird droppings)
- **none_shadow** (images with no insect - shadows of insects or surrounding plants)
- **other** (other Arthropods, including various [Hymenoptera](https://en.wikipedia.org/wiki/Hymenoptera) and [Symphyta](https://en.wikipedia.org/wiki/Sawfly), [Diptera](https://en.wikipedia.org/wiki/Fly), [Orthoptera](https://en.wikipedia.org/wiki/Orthoptera), [Auchenorrhyncha](https://en.wikipedia.org/wiki/Auchenorrhyncha), [Neuroptera](https://en.wikipedia.org/wiki/Neuroptera), [Araneae](https://en.wikipedia.org/wiki/Spider))
- **scorpionfly** ([*Panorpa* sp.](https://en.wikipedia.org/wiki/Panorpa))
- **wasp** (mainly [*Vespula* sp.](https://en.wikipedia.org/wiki/Vespula) and [*Polistes dominula*](https://en.wikipedia.org/wiki/European_paper_wasp))

For the classes **hfly_eupeo** and **hfly_syrphus** a precise taxonomic distinction is not possible with images only, due to a potentially high variability in the appearance of the respective species. While most specimens will show the visual features that are important for a classification into one of these classes, some specimens of *Syrphus* sp. might look more like *Eupeodes* sp. and vice versa.

The images were sorted to the respective class by considering taxonomic and visual distinctions. However, this dataset is still rather small regarding the visually extremely diverse [Insecta](https://en.wikipedia.org/wiki/Insect). Insects that are not included in this dataset can therefore be classified to the wrong class. All results should always be manually validated and false classifications can be used to extend this basic dataset and [retrain](https://maxsitt.github.io/insect-detect-docs/modeltraining/train_classification/) your custom classification model.

---

## Deployment

You can use this dataset as starting point to train your own insect classification models with the provided Google Colab [training notebook](https://colab.research.google.com/github/maxsitt/insect-detect-ml/blob/main/notebooks/YOLOv5_classification_training.ipynb). Read the model training [instructions](https://maxsitt.github.io/insect-detect-docs/modeltraining/train_classification/) for more information.

A insect classification model trained on this dataset is available in the [`insect-detect-ml`](https://github.com/maxsitt/insect-detect-ml#classification-model) GitHub repo. To deploy the model on your PC (ONNX format for fast CPU inference), follow the provided step-by-step [instructions](https://maxsitt.github.io/insect-detect-docs/deployment/classification/).

---

### License

This dataset is licensed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License ([CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/))

### Citation

If you use this dataset, please cite our paper:

```
Sittinger M, Uhler J, Pink M, Herz A (2024) Insect detect: An open-source DIY camera trap for automated insect monitoring. PLoS ONE 19(4): e0295474. https://doi.org/10.1371/journal.pone.0295474
```

---
